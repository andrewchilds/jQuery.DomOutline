# Dom Outline

Firebug/Dev Tools-like DOM outline implementation using jQuery.

### Example Usage

```js
var myExampleClickHandler = function (element) { console.log('Clicked element:', element); }
var myDomOutline = DomOutline({ onClick: myExampleClickHandler, filter: 'div' });

// Start outline:
myDomOutline.start();

// Stop outline (also stopped on escape/backspace/delete keys):
myDomOutline.stop();
```

### Options

<table>
	<tr>
		<th>Option</th>
		<th>Description</th>
		<th>Default</th>
	</tr>
	<tr>
		<td><b>borderWidth</b></td>
		<td>The width of the outline border, in pixels.</td>
		<td>2</td>
	</tr>
	<tr>
		<td><b>onClick</b></td>
		<td>The function fired when the user clicks while the DOM outline is active. Receives the target element as an argument.</td>
		<td>false</td>
	</tr>
	<tr>
		<td><b>namespace</b></td>
		<td>The private namespace used for CSS selectors and events. Available in the unlikely event of possible event/CSS collisions.</td>
		<td>'DomOutline'</td>
	</tr>
	<tr>
		<td><b>filter</b></td>
		<td>A selector that an element should match in order to be outlined and clicked. By default no filter is applied.</td>
		<td>false</td>
	</tr>
	<tr>
    	<td><b>getClosestValidElement</b></td>
    	<td>Get the closest valid parent element if the current element is filtered out but a parent is not</td>
    	<td>false</td>
    </tr>
    <tr>
        <td><b>isOutliningClass</b></td>
        <td>A class that gets applied to the body when DomOutline is open. Defaults to no class</td>
        <td>''</td>
    </tr>
</table>

### Other Notes

* Tested to work in Chrome, FF, Safari. Buggy in IE ;(
* Creates a single global variable: `window.DomOutline`
