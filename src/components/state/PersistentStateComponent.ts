import React from "react";

// TODO.
export class PersistentStateComponent<P, S> extends React.Component<P, S> {

    constructor(props) {
        super(props);

       this.state = this.loadStateFromPersistentStorage();
    }

    setState(state: S) {
        super.setState(state);
    }

    loadStateFromPersistentStorage(): S {
        // TODO
        return null as unknown as S;
    }

    storeStateToPersistentStorage(): void {
        // TODO
    }
}