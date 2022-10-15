import {ComponentType} from "../../components/enums/ComponentType";
import {AbstractFactory} from "../../factories/abstracts/AbstractFactory";
import {ModalInterface} from "../interfaces/ModalInterface";
import {ModalPartInterface} from "../interfaces/ModalPartInterface";
import {CampaignSetting} from "../../components/components/campaign/enums/CampaignSetting";
import {CampaignModalPart} from "../../components/components/campaign/modals/CampaignModalPart";
import {AdventureModalPart} from "../../components/components/adventure/modals/AdventureModalPart";
import {ActModalPart} from "../../components/components/act/modals/ActModalPart";
import {SceneModalPart} from "../../components/components/scene/modals/SceneModalPart";
import {CharacterModalPart} from "../../components/components/character/modals/CharacterModalPart";
import {ClueModalPart} from "../../components/components/clue/modals/ClueModalPart";
import {EventModalPart} from "../../components/components/event/modals/EventModalPart";
import {FactionModalPart} from "../../components/components/faction/modals/FactionModalPart";
import {LocationModalPart} from "../../components/components/location/modals/LocationModalPart";
import {NonPlayerCharacterModalPart} from "../../components/components/character/modals/NonPlayerCharacterModalPart";
import {MusicModalPart} from "../../components/components/music/modals/MusicModalPart";
import {App} from "obsidian";
import {ModalFactoryInterface} from "./interfaces/ModalFactoryInterface";
import {SessionModalPart} from "../../components/components/session/modals/SessionModalPart";
import {SubplotModalPart} from "../../components/components/subplot/modals/SubplotModalPart";

export class ModalFactory extends AbstractFactory implements ModalFactoryInterface{
	private _modalTypeMap: Map<string,any>;

	constructor(
		app: App,
	) {
		super(app);
		this._modalTypeMap = new Map();
		this._modalTypeMap.set('AgnosticCampaign', CampaignModalPart);
		this._modalTypeMap.set('AgnosticAdventure', AdventureModalPart);
		this._modalTypeMap.set('AgnosticAct', ActModalPart);
		this._modalTypeMap.set('AgnosticScene', SceneModalPart);
		this._modalTypeMap.set('AgnosticCharacter', CharacterModalPart);
		this._modalTypeMap.set('AgnosticClue', ClueModalPart);
		this._modalTypeMap.set('AgnosticEvent', EventModalPart);
		this._modalTypeMap.set('AgnosticFaction', FactionModalPart);
		this._modalTypeMap.set('AgnosticLocation', LocationModalPart);
		this._modalTypeMap.set('AgnosticNonPlayerCharacter', NonPlayerCharacterModalPart);
		this._modalTypeMap.set('AgnosticMusic', MusicModalPart);
		this._modalTypeMap.set('AgnosticSession', SessionModalPart);
		this._modalTypeMap.set('AgnosticSubplot', SubplotModalPart);
		this._modalTypeMap.set('AgnosticSceneTypeDescription', SubplotModalPart);

	}
	public create(
		settings: CampaignSetting,
		type: ComponentType,
		modal: ModalInterface,
	): ModalPartInterface {
		let modalKey:string = CampaignSetting[settings] + ComponentType[type];
		if (!this._modalTypeMap.has(modalKey)) modalKey = CampaignSetting[CampaignSetting.Agnostic] + ComponentType[type];
		if (!this._modalTypeMap.has(modalKey)) throw new Error('Type of modal ' + CampaignSetting[settings] + ComponentType[type] + ' cannot be found');

		return new (this._modalTypeMap.get(modalKey))(this.app, modal);
	}
}
