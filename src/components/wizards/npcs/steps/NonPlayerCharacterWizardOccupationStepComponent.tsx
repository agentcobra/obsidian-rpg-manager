import TextInputComponent from "@/components/attributes/primitives/TextInputComponent";
import * as React from "react";
import { useTranslation } from "react-i18next";
import MarkdownComponent from "src/components/markdowns/MarkdownComponent";
import { useWizard } from "src/hooks/useWizard";
import { ChatGptNonPlayerCharacterModel } from "src/services/ChatGptService/models/ChatGptNonPlayerCharacterModel";

export default function NonPlayerCharacterWizardOccupationStepComponent({
	name,
	campaignId,
	chatGpt,
	setOverlay,
}: {
	name: string;
	campaignId?: string;
	chatGpt?: ChatGptNonPlayerCharacterModel;
	setOverlay: (show: boolean) => void;
}): React.ReactElement {
	const { t } = useTranslation();
	const wizardData = useWizard();

	const [occupation, setOccupation] = React.useState<string | undefined>(wizardData.occupation);

	const updateOccupation = (value: string) => {
		wizardData.occupation = value;
		setOccupation(value);
	};

	return (
		<>
			<h3 className="!text-xl !font-extralight">{t("attributes.occupation")}</h3>
			<div className="!mt-3 !mb-3">
				<MarkdownComponent value={t("wizards.npc.description", { context: "occupation", name: name })} />
			</div>
			<div className="">
				<TextInputComponent
					initialValue={occupation}
					campaignId={campaignId}
					onChange={updateOccupation}
					className="w-full resize-none overflow-y-hidden border border-[--background-modifier-border] rounded-md"
				/>
			</div>
		</>
	);
}
