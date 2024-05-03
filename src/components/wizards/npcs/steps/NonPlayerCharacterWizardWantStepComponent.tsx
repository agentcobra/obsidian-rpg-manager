import MarkdownEditorComponent from "@/components/editors/MarkdownEditorComponent";
import { ElementInterface } from "@/data/interfaces/ElementInterface";
import * as React from "react";
import { useTranslation } from "react-i18next";
import ChatGptSuggestionComponent from "src/components/chatgpt/ChatGptSuggestionComponent";
import MarkdownComponent from "src/components/markdowns/MarkdownComponent";
import { useWizard } from "src/hooks/useWizard";
import { ChatGptNonPlayerCharacterModel } from "src/services/ChatGptService/models/ChatGptNonPlayerCharacterModel";

export default function NonPlayerCharacterWizardWantStepComponent({
  name,
  campaign,
  chatGpt,
  setOverlay,
}: {
  name: string;
  campaign?: ElementInterface;
  chatGpt?: ChatGptNonPlayerCharacterModel;
  setOverlay: (show: boolean) => void;
}): React.ReactElement {
  const { t } = useTranslation();
  const wizardData = useWizard();

  const [key, setKey] = React.useState<number>(Date.now());
  const [want, setWant] = React.useState<string | undefined>(wizardData.want);

  const updateWant = (value: string) => {
    wizardData.want = value;
    setWant(value);
  };

  const applySuggestion = (suggestion: string) => {
    const updatedWant = want ? `${want}\n${suggestion}` : suggestion;

    updateWant(updatedWant);
    setKey(Date.now());
  };

  async function generateSuggestions(): Promise<string[]> {
    try {
      setOverlay(true);
      return chatGpt.getWant().then((value: string[]) => {
        setOverlay(false);
        return value;
      });
    } catch (error) {
      console.error("Failed to fetch behaviour:", error);
    }
  }

  return (
    <>
      <h3 className="!text-xl !font-extralight">{t("attributes.want")}</h3>
      <div className="!mt-3 !mb-3">
        <MarkdownComponent
          value={t("wizards.npc.description", { context: "want", name: name })}
        />
      </div>
      <div className="">
        <MarkdownEditorComponent
          key={key}
          initialValue={want}
          campaign={campaign}
          onChange={updateWant}
          className="w-full resize-none overflow-y-hidden border border-[--background-modifier-border] rounded-md"
        />
      </div>
      {chatGpt && (
        <ChatGptSuggestionComponent
          generateSuggestions={generateSuggestions}
          applySuggestions={applySuggestion}
        />
      )}
    </>
  );
}
