# sciter virtual table

Exploring [sciter.js](https://sciter.com/) virtual lists.

This project is derivated from the [virtual table example](https://github.com/c-smile/sciter-js-sdk/blob/main/samples.sciter/virtual-list/test-table.htm).

![sciter virtual table screenshot](screenshot.png)

## demo

- git clone the repository
- on Linux/Mac `chmod +x install.sh start.sh`
- run `install.bat` (Win) or `./install.sh` (Linux/Mac) to download the latest sciter binaries and the sciter package manager
- install packages `php bin/spm.phar install`
- run `start.bat` (Win) or `./start.sh` (Linux/Mac)

## install

- add the `src` dir to your project or use the sciter package manager
- in your code

```html
<style src="src/vbody.css" />
<body>
    <table>
        <thead>
            <th>index</th>
            <th>first name</th>
            <th>middle name</th>
            <th>last name</th>
            <th>age</th>
        </thead>
        <tbody styleset="#vbody" />
    </table>
```

## how it actually works

Virtual lists are virtual because only part of the data is added to the html DOM. By doing so the table is much more responsive. In the screenshot below, the yellow and blue rows 6 to 22 are added to the DOM, the blue rows are visible in the interface and the gray rows at both ends are neither added to the DOM, nor visible.

![virtual-list screenshot](virtual-list.png)

## virtual list behavior

Assigning the `virtual-list` behavior adds the `vlist` object to the `body` element which has the following properties:

- `firstVisibleItem: Element`

first body element that is visible

- `lastVisibleItem: Element`

last body element that is visible

- `firstBufferIndex: int`

index of first element that is in memory

- `lastBufferIndex: int`

index of last element that is in memory
