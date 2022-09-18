import {CampaignSetting} from "../enums/CampaignSetting";
import {RecordInterface} from "../interfaces/database/RecordInterface";
import {RpgErrorInterface} from "../interfaces/RpgErrorInterface";
import {App, CachedMetadata, TFile} from "obsidian";
import {DatabaseInterface} from "../interfaces/database/DatabaseInterface";
import {ErrorLog, InfoLog, LogMessageType, WarningLog} from "../helpers/Logger";
import {AbstractOutlineRecord} from "../abstracts/database/AbstractOutlineRecord";
import {RpgError} from "../errors/RpgError";
import {MisconfiguredDataModal} from "../modals/MisconfiguredDataModal";
import {DataType} from "../enums/DataType";

export class DatabaseInitialiser {
    private static campaignSettings: Map<number, CampaignSetting> = new Map();
	private static misconfiguredTags: Map<TFile, RpgErrorInterface> = new Map();
	private static app: App;
	private static database: DatabaseInterface;

	public static async initialise(
		app: App,
	): Promise<DatabaseInterface> {
		await new InfoLog(LogMessageType.DatabaseInitialisation, 'Initialisation started');

		this.app = app;
		this.misconfiguredTags = await new Map();

		this.database = await this.app.plugins.getPlugin('rpg-manager').factories.database.create();
		const temporaryDatabase = await this.app.plugins.getPlugin('rpg-manager').factories.database.create();

		await this.loadCampaignSettings();
		await new InfoLog(LogMessageType.DatabaseInitialisation, 'Campaign rpgs read');

		const markdownFiles: TFile[] = app.vault.getMarkdownFiles();
		for (let index=0; index<markdownFiles.length; index++){
			try {
				const data: RecordInterface|undefined = await this.createComponent(markdownFiles[index]);

				if (data !== undefined) {
					if (data instanceof AbstractOutlineRecord) await data.checkDuplicates(temporaryDatabase);
					await temporaryDatabase.create(data);
				}
			} catch (e) {
				if (e instanceof RpgError) {
					this.misconfiguredTags.set(markdownFiles[index], e as RpgErrorInterface);
				} else {
					throw e;
				}
			}
		}

		new InfoLog(LogMessageType.DatabaseInitialisation, 'Temporary database initialised', temporaryDatabase);

		await this.buildHierarchyAndRelationships(temporaryDatabase);

		console.log(temporaryDatabase);

		if (this.misconfiguredTags.size > 0){
			new MisconfiguredDataModal(this.app, this.misconfiguredTags).open();
		}

		this.database.ready();

		new InfoLog(LogMessageType.Database, 'Database Ready', this.database);

		return this.database;
	}

	/**
	 * Creates a Record from an Obsidian TFile
	 *
	 * @param file
	 * @private
	 */
	public static async createComponent(
		file: TFile,
	): Promise<RecordInterface|undefined> {
		let response: RecordInterface|undefined;

		const metadata: CachedMetadata|null = this.app.metadataCache.getFileCache(file);
		new InfoLog(LogMessageType.DatabaseInitialisation, 'Record TFile metadata read', metadata);
		if (metadata == null) return;

		const dataTags = this.app.plugins.getPlugin('rpg-manager').tagManager.sanitiseTags(metadata?.frontmatter?.tags);
		new InfoLog(LogMessageType.DatabaseInitialisation, 'Record tags initialised', dataTags);
		const dataTag = this.app.plugins.getPlugin('rpg-manager').tagManager.getDataTag(dataTags);
		new InfoLog(LogMessageType.DatabaseInitialisation, 'Record tag initialised', dataTag);
		if (dataTag == undefined) return;

		const dataType = this.app.plugins.getPlugin('rpg-manager').tagManager.getDataType(undefined, dataTag);

		if (dataType === undefined) {
			new WarningLog(LogMessageType.DatabaseInitialisation, 'TFile is not a record');
			return
		}
		new InfoLog(LogMessageType.DatabaseInitialisation, 'Record type initialised', DataType[dataType]);

		const campaignId = this.app.plugins.getPlugin('rpg-manager').tagManager.getId(DataType.Campaign, dataTag);
		if (campaignId === undefined) new ErrorLog(LogMessageType.DatabaseInitialisation, 'Campaign Id not found', dataTag);

		const settings = this.campaignSettings.get(campaignId);
		//if (settings === undefined) new ErrorLog(LogMessageType.DatabaseInitialisation, 'Settings Missing!');

		if (campaignId !== undefined && settings !== undefined) {
			response = await this.app.plugins.getPlugin('rpg-manager').factories.data.create(
				settings,
				dataTag,
				dataType,
				file
			);
			await response.initialise();
			new InfoLog(LogMessageType.DatabaseInitialisation, 'Record Created', response);
		}

		return response;
	}

	/**
	 * PRIVATE METHODS
	 */

	private static loadCampaignSettings(
	): void {
		this.app.vault.getMarkdownFiles().forEach((file: TFile) => {
			const metadata: CachedMetadata|null = this.app.metadataCache.getFileCache(file);
			if (metadata !== null) {
				const dataTags = this.app.plugins.getPlugin('rpg-manager').tagManager.sanitiseTags(metadata?.frontmatter?.tags);
				if (this.app.plugins.getPlugin('rpg-manager').tagManager.getDataType(dataTags) === DataType.Campaign){
					try {
						const campaignId = this.app.plugins.getPlugin('rpg-manager').tagManager.getId(DataType.Campaign, undefined, dataTags);
						if (campaignId !== undefined) {
							const settings = metadata?.frontmatter?.settings !== undefined ?
								CampaignSetting[metadata?.frontmatter?.settings as keyof typeof CampaignSetting] :
								CampaignSetting.Agnostic;
							this.campaignSettings.set(campaignId, settings);
						}
					} catch (e) {
						//No need to trap the errors here
					}
				}
			}
		});
	}

	/**
	 * Builds the entire hierarchy and relationships for all the elements in the temporary database
	 *
	 * @private
	 */
	private static async buildHierarchyAndRelationships(
		temporaryDatabase: DatabaseInterface,
	): Promise<void> {
		new InfoLog(LogMessageType.DatabaseInitialisation, 'Building Hierarchy', temporaryDatabase);
		return this.addHierarchy(temporaryDatabase, DataType.Campaign)
			.then(() => {
				new InfoLog(LogMessageType.DatabaseInitialisation, 'Hierarchy built', temporaryDatabase);
				return this.buildRelationships(temporaryDatabase)
					.then(() => {
						new InfoLog(LogMessageType.DatabaseInitialisation, 'Relationships connected', temporaryDatabase);
						return;
					});
			});
	}

	/**
	 * Adds the hierarchical structure to the outline Records from the temporary database and adds the valid Records to the final database
	 * Calling `addHierarchy(DataType.Campaign)` creates a cascade that adds the hierarchy to all the elements in the database
	 *
	 * @param dataType
	 * @private
	 */
	private static async addHierarchy(
		temporaryDatabase: DatabaseInterface,
		dataType: DataType|undefined,
	): Promise<void> {
		new InfoLog(LogMessageType.DatabaseInitialisation, 'Loading hierarchy', (dataType !== undefined ? DataType[dataType] : 'Elements'));
		const data: RecordInterface[] = temporaryDatabase.read(
			(data: RecordInterface) => (dataType !== undefined ? (dataType & data.type) === data.type : data.isOutline === false),
		);

		for (let index=0; index<data.length; index++){
			await data[index].loadHierarchy(this.database);
			try {
				this.database.create(data[index]);
			} catch (e) {
				if (e instanceof RpgError) {
					this.misconfiguredTags.set(data[index].file, e as RpgErrorInterface);
				} else {
					throw e;
				}
			}
		}

		if (dataType === undefined) return;

		switch (dataType) {
			case DataType.Campaign:
				return await this.addHierarchy(temporaryDatabase, DataType.Adventure);
				break;
			case DataType.Adventure:
				return await this.addHierarchy(temporaryDatabase, DataType.Session);
				break;
			case DataType.Session:
				return await this.addHierarchy(temporaryDatabase, DataType.Scene);
				break;
			case DataType.Scene:
				return await this.addHierarchy(temporaryDatabase, DataType.Note);
				break;
			case DataType.Note:
				return await this.addHierarchy(temporaryDatabase, undefined);
				break;
			default:
				return;
				break;
		}
	}

	/**
	 * Adds the relationships to every Record in the database, including the reverse relationships between non-outline Records
	 *
	 * @private
	 */
	private static async buildRelationships(
		database: DatabaseInterface,
	): Promise<void> {
		for (let index=0; index<database.elements.length; index++){
			await database.elements[index].loadRelationships(database);
		}
		for (let index=0; index<database.elements.length; index++){
			if (!database.elements[index].isOutline) await database.elements[index].loadReverseRelationships(database);
		}
	}
}
