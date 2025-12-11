'use client';

import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer>
            <span className="my-footer">
                {t('footer.copyright')} &copy; {new Date().getFullYear()}
            </span>
        </footer>
    );
}

