import {AbstractHeaderView} from "../../../managers/viewsManager/abstracts/AbstractHeaderView";
import {NewHeaderViewInterface} from "../../../managers/viewsManager/interfaces/NewHeaderViewInterface";
import {ActInterface} from "../interfaces/ActInterface";
import {LongTextElement} from "../../../managers/viewsManager/elements/LongTextElement";
import {AbtStageElement} from "../../../services/plotsService/views/elements/AbtStageElement";
import {AnalyserService} from "../../../services/analyserService/AnalyserService";
import {AnalyserInterface} from "../../../services/analyserService/interfaces/AnalyserInterface";
import {AnalyserReportType} from "../../../services/analyserService/enums/AnalyserReportType";
import {ParentSwitcherSelectorElement} from "../../../managers/viewsManager/elements/ParentSwitcherSelectorElement";
import {AdventureInterface} from "../../adventure/interfaces/AdventureInterface";
import {ComponentType} from "../../../core/enums/ComponentType";
import i18next from "i18next";

export class ActHeaderView extends AbstractHeaderView implements NewHeaderViewInterface {
	public model: ActInterface;

	public render(): void {
		this.addBreadcrumb();
		this.addTitle();
		this.addComponentOptions();
		this.addGallery();

		const adventures: AdventureInterface[] = this.api.database.readChildren<AdventureInterface>(ComponentType.Adventure, this.model.index.campaignId);
		this.addInfoElement(ParentSwitcherSelectorElement, {
			model: this.model,
			title: i18next.t("part_of_adventure", {ns: "elements"}),
			values: {index: this.model.index, list: adventures}
		});

		this.addInfoElement(LongTextElement, {
			model: this.model,
			title: i18next.t("description"),
			values: this.model.synopsis ?? '',
			editableKey: 'data.synopsis'
		});

		if (this.api.settings.usePlotStructures) {
			this.addInfoElement(AbtStageElement, {
				model: this.model,
				title: i18next.t("abt_stage"),
				values: this.model.abtStage,
				editableKey: 'data.abtStage'
			});

			this.addPlot();
		}

		if (this.api.settings.useSceneAnalyser) {
			const analyser: AnalyserInterface = this.api.service(AnalyserService).createAct(this.model, this.model.abtStage);

			if (analyser.scenesCount > 0) {
				this.addAnalyser(analyser, AnalyserReportType.Visual);
				this.addAnalyser(analyser, AnalyserReportType.Extended);
			}
		}
	}
}
