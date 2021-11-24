export class VBody extends Element
{
    data  = null;
    items = 0;
    selected;

    /**
     * Constructor
     */
    constructor()
    {
        super();
    }

    /**
     * On attached to DOM tree
     * @return void
     */
    componentDidMount()
    {
        //this.items = this.attributes.items ?? 1000;
        //console.debug(`virtual table contains ${this.items} items`);
    }

    /**
     * Update component
     * @param array data
     */
    componentUpdate(data)
    {
        this.data  = data;
        this.items = this.data.length;

        //this.render();
    }

    /**
     * Content required
     * @param Event
     * @return bool
     */
    oncontentrequired(event)
    {
        let {length, start, where} = event.data;

        if (where > 0)
            // scrolling down, need to append more elements
            event.data = this.appendRows(start, length);
        else
        if (where < 0)
            // scrolling up, need to prepend more elements
            event.data = this.prependRows(start, length);
        else
            // scrolling to index
            event.data = this.replaceRows(start, length);

        return true;
    }

    /**
     * Render row
     * @param int row index
     */
    renderRow(index)
    {
        const row = (
            <tr index={index} state-current={this.selected === index}>
                <td>{index}</td>
                <td>{ this.data[index][0] }</td>
                <td>{ this.data[index][1] }</td>
                <td>{ this.data[index][2] }</td>
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
    appendRows(index, length)
    {
        console.debug(`appendRows(${index}, ${length})`);

        if (index === undefined)
            index = 0;

        // create rows
        let elements = [];

        for (let i = 0; i < length; ++i, ++index) {
            if (index >= this.items)
                break;

            elements.push(this.renderRow(index));
        }

        this.append(elements);

        // return estimated number of items below
        return {
            moreafter: this.items - index
        };
    }

    /**
     * Prepend rows (scroll up)
     * @param int index
     * @param int length
     * @return object
     */
    prependRows(index, length)
    {
        console.debug(`prependRows(${index}, ${length})`);

        if (index === undefined)
            index = this.items - 1;

        // create rows
        let elements = [];

        for (let i = 0; i < length; ++i, --index) {
            if (index < 0)
                break;

            elements.push(this.renderRow(index));
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
    replaceRows(index, length)
    {
        console.debug(`replaceRows(${index}, ${length})`);

        let elements = [];
        let start = index;

        for (let i = 0; i < length; ++i, ++index) {
            if (index >= this.items)
                break;

            elements.push(this.renderRow(index));
        }

        this.patch(elements);

        // return estimated number of items before and above this chunk
        return {
            morebefore: start <= 0 ? 0 : start,
            moreafter: this.items - index
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
        this.debug();

        // get row index in table
        this.selected = row.elementIndex;

        console.debug("selected", this.selected);

        // change row state
        row.state.current = true;

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
        //console.debug(event.code);

        console.line();
        this.debug();

        switch (event.code) {
            case "KeyUP":
                if (this.selected > 0)
                    --this.selected;

                // unselect row
                this.children[this.selected - this.vlist.firstBufferIndex + 1].state.current = false;

                // select row
                this.children[this.selected - this.vlist.firstBufferIndex].state.current = true;

                // scroll window if needed
                const firstVisibleIndex = Number(this.vlist.firstVisibleItem.attributes.index);

                if (this.selected > 0 && this.selected === firstVisibleIndex) {
                    console.debug("navigate to", firstVisibleIndex -1);
                    this.vlist.navigate(firstVisibleIndex -1);

                    this.debug();
                }

                break;

            case "KeyDOWN":
                if (this.selected < this.items -1)
                    ++this.selected;

                // unselect row
                this.children[this.selected - this.vlist.firstBufferIndex - 1].state.current = false;

                // select row
                this.children[this.selected - this.vlist.firstBufferIndex].state.current = true;

                // scroll window if needed
                if (this.selected < this.items -1 && this.selected == this.vlist.lastVisibleItem.attributes.index) {
                    const firstVisibleIndex = Number(this.vlist.firstVisibleItem.attributes.index);

                    console.debug("navigate to", firstVisibleIndex + 1);
                    this.vlist.navigate(firstVisibleIndex +1);

                    this.debug();
                }

                break;

            default:
                // event not handled, propagate
                return false;
        }

        console.debug("selected", this.selected);

        // event handled, no further propagation
        return true;
    }

    /**
     * Debug list
     * @return void
     */
    debug()
    {
        console.debug(`buffered [${this.vlist.firstBufferIndex}-${this.vlist.lastBufferIndex}]`);
        console.debug(`visible  [${this.vlist.firstVisibleItem.attributes.index}-${this.vlist.lastVisibleItem.attributes.index}]`);
    }
}
