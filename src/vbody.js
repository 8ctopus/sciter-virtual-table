export class VBody extends Element
{
    #debug;

    #data    = null;
    #count   = 0;
    #columns = null;

    #selected;

    /**
     * On attached to DOM tree
     * @return void
     */
    componentDidMount()
    {
        this.#debug = this.hasAttribute("debug");
    }

    /**
     * Update component
     * @param object data
     * @return void
     */
    componentUpdate(data)
    {
        if (data === undefined)
            return;

        if (data.data) {
            this.#data  = data.data;
            this.#count = this.#data.length;
            this.#selected = undefined;
        }

        if (data.columns)
            this.#columns = data.columns;
        else
            this.#columns = null;

        this.update();
    }

    /**
     * Repaint component
     * @return void
     */
    update()
    {
        if (this.vlist.firstBufferIndex !== undefined)
            this.#replaceRows(this.vlist.firstBufferIndex, this.vlist.lastBufferIndex - this.vlist.firstBufferIndex + 1);
        else
            this.#appendRows(0, 100);
    }

    /**
     * Content required
     * @param Event
     * @return bool
     */
    oncontentrequired(event)
    {
        if (this.#debug)
            console.debug("on content required");

        let {length, start, where} = event.data;

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
     * Render row
     * @param int row index
     */
    #renderRow(index)
    {
        let cells = [];

        if (this.#debug)
            cells.push(<td>{index}</td>);

        // add row cells
        if (this.#columns) {
            // show selected columns
            this.#columns.forEach(row => {
                cells.push(<td>{ this.#data[index][row] }</td>);
            });
        }
        else
            // show all columns
            for (let i = 0; i < this.#data[0].length; ++i)
                cells.push(<td>{ this.#data[index][0] }</td>);

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
     * @param int index
     * @param int length
     * @return object
     */
    #appendRows(index, length)
    {
        if (this.#debug)
            console.debug(`appendRows(${index}, ${length})`);

        if (index === undefined)
            index = 0;

        // create rows
        let elements = [];

        for (let i = 0; i < length; ++i, ++index) {
            if (index >= this.#count)
                break;

            elements.push(this.#renderRow(index));
        }

        this.append(elements);

        // return estimated number of items below
        return {
            moreafter: this.#count - index
        };
    }

    /**
     * Prepend rows (scroll up)
     * @param int index
     * @param int length
     * @return object
     */
    #prependRows(index, length)
    {
        if (this.#debug)
            console.debug(`prependRows(${index}, ${length})`);

        if (index === undefined)
            index = this.#count - 1;

        // create rows
        let elements = [];

        for (let i = 0; i < length; ++i, --index) {
            if (index < 0)
                break;

            elements.push(this.#renderRow(index));
        }

        elements.reverse();

        this.prepend(elements);

        // return estimated number of items above
        return {
            morebefore: index < 0 ? 0 : index + 1
        };
    }

    /**
     * Replace rows (scroll to index)
     * @param int index
     * @param int length
     * @return object
     */
    #replaceRows(index, length)
    {
        if (this.#debug)
            console.debug(`replaceRows(${index}, ${length})`);

        let elements = [];
        let start = index;

        for (let i = 0; i < length; ++i, ++index) {
            if (index >= this.#count)
                break;

            elements.push(this.#renderRow(index));
        }

        this.patch(elements);

        // return estimated number of items before and above this chunk
        return {
            morebefore: start <= 0 ? 0 : start,
            moreafter: this.#count - index
        };
    }

    /**
     * On row click
     * @param Event event
     * @param Element row
     * @return bool true if no further event propagation
     */
    ["on click at tr"](event, row)
    {
        if (this.#debug)
            this.#debugInfo();

        // get row index in table
        this.select(row.attributes.index);

        // event handled, no further propagation
        return true;
    }

    /**
     * On key down
     * @param Event
     * @return bool true if no further event propagation
     */
    onkeydown(event)
    {
        if (this.#debug)
            this.#debugInfo();

        switch (event.code) {
            case "KeyUP":
                if (this.#selected > 0)
                    this.select(--this.#selected);

                this.#sendEventSelected();

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

            case "KeyDOWN":
                if (this.#selected < this.#count -1)
                    this.select(++this.#selected);

                this.#sendEventSelected();

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
     * @param int row
     */
    select(row)
    {
        if (row === undefined || row < 0 || this.#count === 0 || row > this.#count)
            return;

        // unselect currently selected row
        this.#setRowState(this.#selected, false);

        this.#selected = row;

        // select new row
        this.#setRowState(this.#selected, true);

        // dispatch event
        this.#sendEventSelected();
    }

    /**
     * Get rows count
     * @return int
     */
    count()
    {
        return this.#count;
    }

    /**
     * Get selected row
     * @return int
     */
    selected()
    {
        return this.#selected;
    }

    /**
     * Set row state
     * @param int row
     * @param bool state true selected, false otherwise
     * @return void
     */
    #setRowState(row, state)
    {
        if (this.#debug)
            console.debug("set row state", row, state);

        const index = row - this.vlist.firstBufferIndex;

        if (index >= 0 && index < this.vlist.lastBufferIndex)
            this.children[index].state.current = state;
    }

    /**
     * Debug list
     * @return void
     */
    #debugInfo()
    {
        console.debug(`buffered [${this.vlist.firstBufferIndex}-${this.vlist.lastBufferIndex}]`);
        console.debug(`visible  [${this.vlist.firstVisibleItem.attributes.index}-${this.vlist.lastVisibleItem.attributes.index}]`);
    }

    /**
     * Send row selected event
     * @return void
     */
    #sendEventSelected()
    {
        // send selected event
        this.postEvent(new CustomEvent("selected", {
            bubbles: true,
            detail: {
                selected: this.#selected,
            }
        }));
    }
}
