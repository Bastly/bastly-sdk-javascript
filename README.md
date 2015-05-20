# Bastly SDK

Bastly offers the hability to create realtime apps. You only need to write a frew lines in your app to enable synchronization across all your connected devices.

```js
var bastly = bastly("likes","likes",function callback(data){

    console.log('getting');
    $("span").html(function(i, val) {
      return val * 1 + 1;
  });
}, 'connectorrest.bastly.com');

//call this when click
$("button").click(function(){
    console.log('sending');
    bastly.send("likes", {likes:1}, function (data) { });
});
```

## Installation

### npm
1. Donwload 
```bash
$ npm install bastly
```

### bower

1. Install bastly and save it as a bower dependency
```bash
$ bower install bastly --save
```
1. Create a script tag right before your `body` close tag that points to bastly
1. Place your script below the bastly script

```html
<script type="text/javascript" src="path/to/bastly/script"></script>
<script type="text/javascript">
    // Your code goes here
</script>
```

### manually

1. Download [bastly script]() and place it in your project folder
1. Place bastly script right before your `body` close tag
1. Place your script below the bastly script

```html
<script type="text/javascript" src="path/to/bastly/script"></script>
<script type="text/javascript">
    // Your code goes here
</script>
```

## Usage

```js
var bastly = bastly("likes","likes",function callback(data){
    console.log('getting');
    $("span").html(function(i, val) {
      return val * 1 + 1;
    });
}, 'connectorrest.bastly.com');

//call this when click
$("button").click(function(){
    console.log('sending');
    bastly.send("likes", {likes:1}, function (data) { });
});
```
