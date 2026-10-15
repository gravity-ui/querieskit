export type BuiltinQueryEngineId = 'yql' | 'chyt' | 'spyt' | 'ql';

/** Engine-specific form data. Backend key conversion and defaults belong to the application. */
export type BuiltinEngineSettings = {
    yqlVersion?: string;
    clique?: string;
    discoveryGroup?: string;
    /** JSON object text committed with Save in the SPYT settings section. */
    spytConfig?: string;
};

export type BuiltinQueryClique = {
    alias: string;
    operationId?: string;
    state?: string;
    health?: string;
    disabled?: boolean;
};

export type BuiltinDiscoveryGroup = {
    path: string;
    title?: string;
    disabled?: boolean;
};

export type BuiltinQueryEnginesOptions = {
    /** Engines to include, in order. Defaults to yql, chyt, spyt, ql. */
    engines?: readonly BuiltinQueryEngineId[];
    yql?: {
        /** Omit or pass an empty list to hide the version field. */
        versions?: readonly string[];
    };
    chyt?: {
        /** Options for the current cluster. Undefined means not loaded; [] means loaded empty. */
        cliques?: readonly BuiltinQueryClique[];
        loading?: boolean;
    };
    spyt?: {
        /** Enables the JSON config instead of the legacy discovery selector. */
        connectAvailable?: boolean;
        discoveryGroups?: readonly BuiltinDiscoveryGroup[];
        loading?: boolean;
    };
};
