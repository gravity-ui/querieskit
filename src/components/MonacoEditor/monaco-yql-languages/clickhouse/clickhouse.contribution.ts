import {registerLanguage} from '../_.contribution';
import {MonacoLanguage} from '../constants';

registerLanguage({
    id: MonacoLanguage.CHYT,
    extensions: [],
    loader: async () => {
        const lang = await import('./clickhouse');
        return {
            conf: lang.conf,
            language: lang.language,
        };
    },
});
