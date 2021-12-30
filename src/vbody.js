export class VBody extends Element {
    #debug;

    #data = undefined;
    #count = 0;
    #columns = undefined;

    #selected;

    /**
     * On component attached to DOM tree event
     */
    componentDidMount() {
        this.#debug = this.hasAttribute("debug");
    }

    /**
     * On content required event
     * @param {Event} event
     * @returns {boolean}
     */
    oncontentrequired(event) {
        if (this.#debug)
            console.debug("on content required");

        const {length, start, where} = event.data;

        if (where > 0)
            // scrolling down, need to append more elements
            event.data = this.#appendRows(start, length);
        else
        if (where < 0)
            // scrolling up, need to prepend more elements
            event.data = this.#prependRows(start, length);
        else
            // scrolling to index
            event.data = this.#replaceRows(start, length);

        return true;
    }

    /**
     * Update component
     * @param {Array} data
     */
    update(data) {
        if (data) {
            if (data.data) {
                // update data
                this.#data = data.data;
                this.#count = this.#data.length;

                // reset selected and columns
                this.#selected = undefined;
                this.#columns = undefined;
            }

            if (data.columns)
                // update columns
                this.#columns = data.columns;
        }

        // force refresh
        this.vlist.navigate("itemnext");
        this.vlist.navigate("itemprior");

        /*
        // force refresh
        if (this.vlist.firstBufferIndex !== undefined)
            this.#replaceRows(this.vlist.firstBufferIndex, this.vlist.lastBufferIndex - this.vlist.firstBufferIndex + 1);
        else
            this.#appendRows(0, 100);
*/
    }

    /**
     * Render row
     * @param {number} index - row index
     * @returns {JSX}
     */
    #renderRow(index) {
        const cells = [];

        if (this.#debug)
            cells.push(<td>{index}</td>);

        // add row cells
        if (this.#columns) {
            // show selected columns
            for (const row of this.#columns)
                cells.push(<td>{ this.#data[index][row] }</td>);
        }
        else {
            // show all columns
            for (let index_ = 0; index_ < this.#data[0].length; ++index_)
                cells.push(<td>{ this.#data[index][0] }</td>);
        }

        // create row
        const row = (
            <tr index={index} state-current={this.#selected === index}>
                {cells}
            </tr>
        );

        return row;
    }

    /**
     * Append rows (scroll down)
     * @param {number} index
     * @param {number} length
     * @returns {object}
     */
    #appendRows(index, length) {
        const timer = new Date();

        if (index === undefined)
            index = 0;

        // create rows
        const elements = [];

        for (let index_ = 0; index_ < length; ++index_, ++index) {
            if (index >= this.#count)
                break;

            elements.push(this.#renderRow(index));
        }

        this.append(elements);

        if (this.#debug)
            console.debug(`appendRows(${index}, ${length})`, `total time ${Date.now() - timer}ms`);

        // return estimated number of items below
        return {
            moreafter: this.#count - index,
        };
    }

    /**
     * Prepend rows (scroll up)
     * @param {number} index
     * @param {number} length
     * @returns {object}
     */
    #prependRows(index, length) {
        const timer = new Date();

        if (index === undefined)
            index = this.#count - 1;

        // create rows
        const elements = [];

        for (let index_ = 0; index_ < length; ++index_, --index) {
            if (index < 0)
                break;

            elements.push(this.#renderRow(index));
        }

        elements.reverse();

        this.prepend(elements);

        if (this.#debug)
            console.debug(`prependRows(${index}, ${length})`, `total time ${Date.now() - timer}ms`);

        // return estimated number of items above
        return {
            morebefore: index < 0 ? 0 : index + 1,
        };
    }

    /**
     * Replace rows (scroll to index)
     * @param {number} index
     * @param {number} length
     * @returns {object}
     */
    #replaceRows(index, length) {
        const timer = new Date();

        const elements = [];
        const start = index;

        for (let index_ = 0; index_ < length; ++index_, ++index) {
            if (index >= this.#count)
                break;

            elements.push(this.#renderRow(index));
        }

        this.patch(elements);

        if (this.#debug)
            console.debug(`replaceRows(${index}, ${length})`, `total time ${Date.now() - timer}ms`);

        // return estimated number of items before and above this chunk
        return {
            morebefore: start <= 0 ? 0 : start,
            moreafter: this.#count - index,
        };
    }

    /**
     * On row click event
     * @param {Event} event
     * @param {Element} row
     * @returns {boolean} true if no further event propagation
     */
    ["on click at tr"](event, row) {
        if (this.#debug)
            this.#debugInfo();

        // get row index in table
        this.select(row.attributes.index);

        // event handled, no further propagation
        return true;
    }

    /**
     * On key down event
     * @param {Event} event
     * @returns {boolean} true if no further event propagation
     */
    onkeydown(event) {
        if (this.#debug)
            this.#debugInfo();

        switch (event.code) {
            case "KeyUP": {
                if (this.#selected > 0)
                    this.select(--this.#selected);

                this.#postSelectedEvent();

                // scroll window if needed
                const firstVisibleIndex = Number(this.vlist.firstVisibleItem.attributes.index);

                if (this.#selected > 0 && this.#selected === firstVisibleIndex) {
                    if (this.#debug)
                        console.debug("navigate to", firstVisibleIndex -1);

                    this.vlist.navigate(firstVisibleIndex -1);

                    if (this.#debug)
                        this.#debugInfo();
                }

                break;
            }

            case "KeyDOWN":
                if (this.#selected < this.#count -1)
                    this.select(++this.#selected);

                this.#postSelectedEvent();

                // scroll window if needed
                if (this.#selected < this.#count -1 && this.#selected == this.vlist.lastVisibleItem.attributes.index) {
                    const firstVisibleIndex = Number(this.vlist.firstVisibleItem.attributes.index);

                    if (this.#debug)
                        console.debug("navigate to", firstVisibleIndex + 1);

                    this.vlist.navigate(firstVisibleIndex +1);

                    if (this.#debug)
                        this.#debugInfo();
                }

                break;

            default:
                // event not handled, propagate
                return false;
        }

        // event handled, no further propagation
        return true;
    }

    /**
     * Select row
     * @param {number} row
     */
    select(row) {
        if (row === undefined || row < 0 || this.#count === 0 || row > this.#count)
            return;

        // unselect currently selected row
        this.#setRowState(this.#selected, false);

        this.#selected = row;

        // select new row
        this.#setRowState(this.#selected, true);

        // dispatch event
        this.#postSelectedEvent();
    }

    /**
     * Get rows count
     * @returns {number}
     */
    count() {
        return this.#count;
    }

    /**
     * Get selected row index
     * @returns {number}
     */
    selected() {
        return this.#selected;
    }

    /**
     * Set row state
     * @param {number} row
     * @param {boolean} state - true selected, false otherwise
     */
    #setRowState(row, state) {
        if (this.#debug)
            console.debug("set row state", row, state);

        const index = row - this.vlist.firstBufferIndex;

        if (index >= 0 && index < this.vlist.lastBufferIndex)
            this.children[index].state.current = state;
    }

    /**
     * Debug info
     */
    #debugInfo() {
        console.debug(`buffered [${this.vlist.firstBufferIndex}-${this.vlist.lastBufferIndex}]`);
        console.debug(`visible  [${this.vlist.firstVisibleItem.attributes.index}-${this.vlist.lastVisibleItem.attributes.index}]`);
    }

    /**
     * Post row selected event
     */
    #postSelectedEvent() {
        // send selected event
        this.postEvent(new CustomEvent("selected", {
            bubbles: true,
            detail: {
                selected: this.#selected,
            },
        }));
    }
}
