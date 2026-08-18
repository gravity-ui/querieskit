import {MonacoLanguage} from '../../../components';

export const resolveMonacoLanguage = (engine?: string) => {
    const normalized = engine?.toLowerCase();
    switch (normalized) {
        case 'chyt': {
            return MonacoLanguage.CHYT;
        }
        case 'spyt': {
            return MonacoLanguage.SPYT;
        }
        case 'ytql': {
            return MonacoLanguage.YTQL;
        }
        default: {
            return MonacoLanguage.YQL;
        }
    }
};
