# Polarbear v3

This was built for the purpose of people who are familiar with Vue but want a lighter weight option that includes most of the crucial and heavily used Vue options.

### Interpolation & filters

```html
<p>your name backwards and in upper-case is: {{ name | reverse | upper }}</p>
<p>your favorite number times 2 is: {{ favNum * 2 }}</p>
<p>the current year is: {{ getYear() }}</p>
```

### Event binding

```html
<button @click="console.log('btn clicked')">Click me</button>
<button @click="timer += 1">Add 1 min</button>
```

### Data binding 

```html
<input bindval.trim="message" />
<input type="number" bindval.number="itemCount" />
```

### Conditional rendering

```html
<p showif="age >= 18">You are atleast 18.</p>
<p showelse>Sorry. you must be 18</p>
```

### Iterable rendering

```html
<ul>
  <li loopfor="item in groceryList">{{ item }}</li>
</ul>

<ul>
  <li loopfor="(name, phoneNumber, id)">Entry #{{ id }} is for {{ name }} with number: {{ phoneNumber }}</li>
</ul>
```

### Extra reference

```html
<p ref="myParagraph">This is my special case paragraph</p>
```

### Watchers

```javascript
watch: {
  name(oldVal, newVal) {
    console.log(`Name changed from ${oldVal} to ${newVal}`)
  }
}
```

### Global events

```javascript
events: {
  scroll(e) {
    console.log(e);
  }
}
```

### Lifecycle hooks

```javascript
created() {
  console.log("Polarbear instance created.");
},
mounted() {
  console.log("Polarbear instance initial mount.");
}
```




