# Ids Theme Mixin

This mixin adds functionality to change the theme on a component. To use it you need to:

1. Include the IdsThemeMixin in the `mix` list.
1. Make sure if you use connectedCallback that you have a `super.connectedCallback()` in the method
1. Add types for MODE and VERSION to the `d.ts` file for the new attributes.
1. Add the theme mixin name to the @mixes tag for future docs.
1. Add the color changes for each theme scss file. For example:

```css
.ids-container[mode='light'] {
  @include bg-white();
}

.ids-container[mode='dark'] {
  @include bg-slate-90();
}

.ids-container[mode='contrast'] {
  @include bg-slate-10();
}
```

5. In addition you should expose some of the component elements as `parts` do this in the comments and in the template. This gives a way to customize the styles outside of the web components, for flexibility and possible style customizations.

```js
 /**
 * @part tag - the tag element
 * @part icon - the icon element
 */

 // Later...
 template() {
   return '<span class="ids-tag" part="tag"><slot></slot></span>';
 }
```
6. Add a themeable parts section to the .MD file
