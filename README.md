# sciter virtual table

![latest version](https://img.shields.io/npm/v/sciter-virtual-table.svg)
![downloads](https://img.shields.io/npm/dy/sciter-virtual-table.svg)

Exploring [sciter.js](https://sciter.com/) virtual lists.

This project is derivated from the [virtual table example](https://github.com/c-smile/sciter-js-sdk/blob/main/samples.sciter/virtual-list/test-table.htm).

![sciter virtual table screenshot](https://github.com/8ctopus/sciter-virtual-table/raw/master/screenshot.png)

## demo

- git clone the repository
- install packages `npm install`
- install latest sciter sdk `npm run install-sdk`
- start the demo `npm run scapp`

## demo requirements

- A recent version of Node.js `node` (tested with 16 LTS) and its package manager `npm`.
    - On Windows [download](https://nodejs.dev/download/) and run the installer
    - On Linux check the [installation guide](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-20-04#option-2-%E2%80%94-installing-node-js-with-apt-using-a-nodesource-ppa)

## add to your project

You can either add it to your project using npm or by copying the src directory.

### using npm

- install package `npm install sciter-virtual-table`

### copy source

- add the `src` dir to your project

### add to `<script type="module">`

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

Virtual lists are virtual because only part of the data is added to the html DOM. By doing so, the table is much more responsive. In the screenshot below, the yellow and blue rows 6 to 22 are added to the DOM, the blue rows are visible in the interface and the gray rows at both ends are neither added to the DOM, nor visible.

![virtual-list screenshot](https://github.com/8ctopus/sciter-virtual-table/raw/master/virtual-list.png)

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
