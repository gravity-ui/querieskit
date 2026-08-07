import {registerLanguage} from '../_.contribution';
import {MonacoLanguage} from '../constants';

registerLanguage({
    id: MonacoLanguage.SPYT,
    extensions: [],
    loader: async () => {
        const lang = await import('./s-expressions');
        return {
            conf: lang.conf,
            language: lang.language,
        };
    },
});
