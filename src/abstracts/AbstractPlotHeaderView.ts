import {SceneAnalyser, ThresholdResult} from "../helpers/SceneAnalyser";
import {ComponentType} from "../enums/ComponentType";
import {Component, MarkdownRenderer, TFile} from "obsidian";
import {AbstractStoryCircleStageSelectorView} from "./AbstractStoryCircleStageSelectorView";
import {HeaderResponseElementInterface} from "../interfaces/response/subModels/HeaderResponseElementInterface";
import {AbtStage} from "../enums/AbtStage";

export abstract class AbstractPlotHeaderView extends AbstractStoryCircleStageSelectorView {

	//@TODO Move the calculation of the act or session balance outside the View and into the Model
	protected addActBalance(
		analyser: SceneAnalyser,
	): void {
		const analyserEl: HTMLDivElement = this.headerContainerEl.createDiv({cls: 'analyser'});
		const analyserTextEl  = analyserEl.createSpan();

		if (analyser.excitementLevel === ThresholdResult.Correct && analyser.activityLevel === ThresholdResult.Correct){
			analyserTextEl.textContent = 'The' + ComponentType[analyser.parentType] + ' is balanced!';
		} else {
			let text = 'The ' + ComponentType[analyser.parentType] + ' is not balanced!\n';

			switch (analyser.activityLevel) {
				case ThresholdResult.Correct:
					text += 'The amount of active scenes is balanced\n';
					break;
				case ThresholdResult.Higher:
					text += 'There are maybe a bit too many active scenes (_' + analyser.activeScenePercentage + '% of the scenes are active, while you should have around ' + analyser.targetActiveScenePercentage + '%_)\n';
					break;
				case ThresholdResult.CriticallyLow:
					text += '**You don\'t have enough active scenes** (_only ' + analyser.activeScenePercentage + '% of the scenes are active, while you should have around ' + analyser.targetActiveScenePercentage + '%_)\n';
					break;
				case ThresholdResult.Lower:
					text += 'There are maybe not enough active scenes (_' + analyser.activeScenePercentage + '% of the scenes are active, while you should have around ' + analyser.targetActiveScenePercentage + '%_)\n';
					break;
			}

			switch (analyser.excitementLevel) {
				case ThresholdResult.Correct:
					text += 'The number of exciting scenes is balanced\n';
					break;
				case ThresholdResult.Higher:
					text += 'There are maybe a bit too many exciting scenes (_' + analyser.excitingScenePercentage + '% of the scenes are active, while you should have around ' + analyser.targetExcitingScenePercentage + '%_)\n';
					break;
				case ThresholdResult.CriticallyLow:
					text += '**You don\'t have enough exciting scenes** (_only ' + analyser.excitingScenePercentage + '% of the scenes are active, while you should have around ' + analyser.targetExcitingScenePercentage + '%_)\n';
					break;
				case ThresholdResult.Lower:
					text += 'There are maybe not enough exciting scenes (_' + analyser.excitingScenePercentage + '% of the scenes are active, while you should have around ' + analyser.targetExcitingScenePercentage + '%_)\n';
					break;
			}

			MarkdownRenderer.renderMarkdown(
				text,
				analyserTextEl,
				this.sourcePath,
				null as unknown as Component,
			);
		}
	}

	protected addAbtStageSelector(
		contentEl: HTMLDivElement,
		data: HeaderResponseElementInterface,
	): void {
		if (data.additionalInformation?.id !== undefined) {

			const abtSelectorEl = contentEl.createEl("select");
			abtSelectorEl.createEl("option", {
				text: "",
				value: ""
			}).selected = true;

			Object.keys(AbtStage).filter((v) => isNaN(Number(v))).forEach((type, index) => {
				const abtOptionEl = abtSelectorEl.createEl("option", {
					text: type,
					value: type,
				});

				if (data.value.content.toString() === type) abtOptionEl.selected = true;
			});

			abtSelectorEl.addEventListener("change", (e) => {
				const file: TFile|undefined = data.additionalInformation.file;

				if (file !== undefined){
					const map: Map<string,string> = new Map<string, string>();
					map.set('abt', abtSelectorEl.value);
					this.factories.frontmatter.update(file, map);
				}
			});
		}
	}
}
