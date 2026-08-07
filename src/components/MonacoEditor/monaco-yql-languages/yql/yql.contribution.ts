import {registerLanguage} from '../_.contribution';
import {MonacoLanguage} from '../constants';

registerLanguage({
    id: MonacoLanguage.YQL,
    extensions: [],
    loader: async () => {
        const lang = await import('./yql');
        return {
            conf: lang.conf,
            language: lang.language,
        };
    },
});
