import {AbstractComponentTemplateFactory} from "../../abstracts/AbstractComponentTemplateFactory";
import {ControllerMetadataInterface} from "../../../metadatas/controllers/ControllerMetadataInterface";
import {FactionMetadataInterface} from "../../../metadatas/components/FactionMetadataInterface";
import {TagHelper} from "../../../databases/TagHelper";

export class FactionTemplateFactory extends AbstractComponentTemplateFactory {
	public addFrontmatterData(
		frontmatter: any,
	): void {
		frontmatter.tags.push(TagHelper.factionTag + '/' + this.campaignId);
	}

	protected generateDataCodeBlock(
	): string {
		const metadata: FactionMetadataInterface = {
			data: {
				synopsis: '',
				image: '',
				complete: false
			}
		};
		return this.generateRpgManagerDataCodeBlock(metadata);
	}

	public generateInitialCodeBlock(
	): string {
		const metadata: ControllerMetadataInterface = {
			models: {
				header: true,
				lists: {
					pcs: {},
					npcs: {},
					locations: {},
					subplots: {}
				}
			},
		};

		return this.generateRpgManagerCodeBlock(metadata);
	}
}
