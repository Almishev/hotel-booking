import { useTranslation } from 'react-i18next';

const FooterComponent = () => {
    const { t } = useTranslation();
    return (
        <footer>
            <span className="my-footer">
                {t('footer.copyright')} &copy; {new Date().getFullYear()}
            </span>
        </footer>
    );
};

export default FooterComponent;
