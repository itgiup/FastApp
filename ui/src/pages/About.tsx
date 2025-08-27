import { Trans, useTranslation } from 'react-i18next';
import { contact } from '../store/contact';


const About: React.FC = () => {
    // const [renderCount, setRenderCount] = useState(0);
    // const reRender = () => setRenderCount(pre => pre + 1);
    const { t } = useTranslation();

    // Set the document title
    if (typeof document !== 'undefined') {
        document.title = t('About');
    }

    return (
        <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
            <h1>{t('about.title')}</h1>
            <p>{t('about.desc')}</p>
            <h2>{t('about.featuresTitle')}</h2>
            <ul>
                {(Array.isArray(t('about.features', { returnObjects: true }))
                    ? (t('about.features', { returnObjects: true }) as string[])
                    : []
                ).map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                ))}
            </ul>
            <h2>{t('about.contactTitle')}</h2>
            <p>
                <Trans i18nKey="about.contactDesc" values={{ mail: contact.mail }}>
                    If you have any questions or feedback, please contact us via email: <a href={`mailto:${contact.mail}`}>{contact.mail}</a>
                </Trans>
                <br />
                {t('about.reachonTelegram')}: <a href={`${contact.telegram}`} target='_blank'>{contact.telegram}</a>
            </p>
        </div>
    );
};

export default About;