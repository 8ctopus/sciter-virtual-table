export class VTable extends Element
{
    items = 50;

    selected;

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
                <td>{ names[index % names.length] }</td>
                <td>{ ages[index % ages.length] }</td>
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
     */
    ["on click at tr"](event, row)
    {
        // get row index in table
        this.selected = row.elementIndex;

        console.debug(this.selected);

        // change row state
        row.state.current = true;

        return true;
    }

    /**
     * On keydown
     * @param Event
     * @param Element
     */
    onkeydown(event, element)
    {
        switch (event.code) {
            case "KeyUP":
                if (this.selected > 0)
                    --this.selected;

                // change row state
                this.children[this.selected].state.current = true;
                this.children[this.selected + 1].state.current = false;
                break;

            case "KeyDOWN":
                if (this.selected < this.items -1)
                    ++this.selected;

                // change row state
                this.children[this.selected - 1].state.current = false;
                this.children[this.selected].state.current = true;
                break;
        }

        console.debug(this.selected);

        return true;
    }
}
