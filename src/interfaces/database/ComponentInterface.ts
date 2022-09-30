import {ComponentType} from "../../enums/ComponentType";
import {TFile} from "obsidian";
import {RelationshipInterface} from "../RelationshipInterface";
import {DatabaseInterface} from "./DatabaseInterface";
import {BaseCampaignInterface} from "../components/BaseCampaignInterface";
import {RelationshipType} from "../../enums/RelationshipType";
import {IdInterface} from "../components/IdInterface";

export interface ComponentInterface {
	id: IdInterface;

	tags: Array<string>;

	file: TFile;
	basename: string;

	completed: boolean;
	synopsis: string|null;

	additionalInformation: string|null;
	imageUrl: string|undefined;
	imageSrc: string|null|undefined;

	isOutline: boolean;
	campaign: BaseCampaignInterface;
	relationships: Map<string, RelationshipInterface>;
	reverseRelationships: Map<string, RelationshipInterface>;

	initialise(
	): Promise<void>;

	reload(
	): void;

	loadHierarchy(
		database: DatabaseInterface,
	): Promise<void>;

	loadRelationships(
		database: DatabaseInterface,
	): Promise<void>;

	loadReverseRelationships(
		database: DatabaseInterface,
	): Promise<void>;

	addReverseRelationship(
		name: string,
		relationship: RelationshipInterface,
	): void;

	getRelationships(
		type: ComponentType,
		requiredRelationshipType?: RelationshipType,
	): Array<RelationshipInterface>;

	existsInRelationships(
		relationships:  Map<string, RelationshipInterface>,
	): boolean;

	get name(): string;
	get path(): string;
	get link(): string;
	get image(): string|null;
	get imageSrcElement(): HTMLElement|null;
	get folder(): string;
	get version(): number;

	touch(): void;
}
