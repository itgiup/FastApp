import { LuClipboardPaste } from "react-icons/lu";
import { useTranslation } from "react-i18next";

interface Props {
    onPaste: (text: string) => void
    title?: string
}

const BtnPaste: React.FC<Props> = ({ onPaste, title }) => {
    const { t } = useTranslation();

    return <LuClipboardPaste style={{ cursor: 'pointer' }} onClick={() => {
        navigator.clipboard.readText().then(text => {
            onPaste(text);
        });
    }}
        title={title || t('Paste')}
    />
}

export default BtnPaste;