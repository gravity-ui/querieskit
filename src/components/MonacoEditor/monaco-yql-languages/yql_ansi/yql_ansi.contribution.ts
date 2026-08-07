import {registerLanguage} from '../_.contribution';
import {MonacoLanguage} from '../constants';

registerLanguage({
    id: MonacoLanguage.YTQL,
    extensions: [],
    loader: async () => {
        const lang = await import('./yql_ansi');
        return {
            conf: lang.conf,
            language: lang.language,
        };
    },
});
