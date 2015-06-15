# Bastly SDK

Bastly offers the hability to create realtime apps. You only need to write a frew lines in your app to enable synchronization across all your connected devices.

```js
var bastly = bastly({
                from: "alice",
                apiKey: "testApikey",
                callback: function (data){
                    console.log("got data in channel alice");
                    console.log(data);
                }
            });
});

//send data, any JSON object up to 20Kb aprox
bastly.send("bob", {likes:1});

//subscribe to new channel 
bastly.subscribe("anotherChannel", function(data){
    console.log("got data in channel anotherChannel");
    console.log(data);
});
```

## Installation

### Browser
1. Download 
    ```bash
    $ wget http://www.bastly.com/releases/browser/bastly.js
    ```
    or
    ```bash
    $ bower install bastly --save
    ```

1. Place bastly script right before your `body` close tag
1. Place your script below the bastly script

```html
<script type="text/javascript" src="path/to/bastly/script"></script>
<script type="text/javascript">
    // Your code goes here
</script>
```

### npm
1. Donwload
```bash
$ npm install bastly
```

