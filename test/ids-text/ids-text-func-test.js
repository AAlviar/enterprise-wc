/**
 * @jest-environment jsdom
 */
import IdsText from '../../src/ids-text/ids-text';

describe('IdsText Component', () => {
  let elem;

  beforeEach(async () => {
    const text = new IdsText();
    document.body.appendChild(text);
    elem = document.querySelector('ids-text');
  });

  afterEach(async () => {
    document.body.innerHTML = '';
  });

  it('renders with no errors', () => {
    const errors = jest.spyOn(global.console, 'error');
    elem.remove();
    elem = new IdsText();
    document.body.appendChild(elem);
    expect(document.querySelectorAll('ids-text').length).toEqual(1);
    expect(errors).not.toHaveBeenCalled();
  });

  it('renders correctly', () => {
    expect(elem.outerHTML).toMatchSnapshot();
    elem.fontSize = 24;
    expect(elem.outerHTML).toMatchSnapshot();
    elem.type = 'h1';
    expect(elem.outerHTML).toMatchSnapshot();
  });

  it('renders font size setting', () => {
    elem.fontSize = 24;
    expect(elem.fontSize).toEqual('24');
    expect(document.querySelectorAll('ids-text').length).toEqual(1);
  });

  it('renders font-size setting then removes it', () => {
    elem = new IdsText();
    document.body.appendChild(elem);
    elem.fontSize = 24;
    expect(elem.fontSize).toEqual('24');
    elem.fontSize = null;
    expect(elem.fontSize).toEqual(null);
    expect(elem.getAttribute('font-size')).toEqual(null);
  });

  it('renders font weight setting', () => {
    expect(elem.fontWeight).toEqual('normal');
    elem.fontWeight = 'bold';
    expect(elem.getAttribute('font-weight')).toEqual('bold');

    elem.fontWeight = 'bolder';
    expect(elem.getAttribute('font-weight')).toEqual('bolder');

    elem.fontWeight = 'normal';
    expect(elem.fontWeight).toEqual('normal');

    elem.fontWeight = '';
    expect(elem.fontWeight).toEqual('normal');

    document.body.innerHTML = '';
    const templateElem = document.createElement('template');
    templateElem.innerHTML = '<ids-text font-weight="bold">I am bold</ids-text>';
    elem = templateElem.content.childNodes[0];
    document.body.appendChild(elem);
    expect(elem.fontWeight).toEqual('bold');
  });

  it('renders overflow setting', () => {
    elem = new IdsText();
    expect(elem.overflow).toEqual('ellipsis');
    elem.overflow = 'none';
    expect(elem.getAttribute('overflow')).toEqual('none');

    elem.overflow = 'ellipsis';
    expect(elem.getAttribute('overflow')).toEqual('ellipsis');
    elem.overflow = undefined;
    expect(elem.overflow).toEqual('ellipsis');

    document.body.innerHTML = '';
    const templateElem = document.createElement('template');
    templateElem.innerHTML = '<ids-text overflow="none">Cut off before the end--</ids-text>';
    elem = templateElem.content.childNodes[0];
    document.body.appendChild(elem);
    expect(elem.overflow).toEqual('none');
  });

  it('renders type setting', () => {
    elem = new IdsText();
    elem.type = 'h1';
    expect(elem.type).toEqual('h1');
    expect(elem.shadowRoot.querySelectorAll('h1').length).toEqual(1);
  });

  it('renders font-size setting then removes it', () => {
    elem = new IdsText();
    document.body.appendChild(elem);
    elem.type = 'h1';
    expect(elem.type).toEqual('h1');
    elem.type = null;
    expect(elem.type).toEqual(null);
    expect(elem.getAttribute('type')).toEqual(null);
    expect(elem.shadowRoot.querySelectorAll('span').length).toEqual(1);
  });

  it('renders audible setting then removes it', () => { // ids-text audible
    elem = new IdsText();
    document.body.appendChild(elem);
    expect(elem.shadowRoot.querySelectorAll('.audible').length).toEqual(0);
    elem.audible = true;
    expect(elem.shadowRoot.querySelectorAll('.audible').length).toEqual(1);
    elem.audible = false;
    expect(elem.shadowRoot.querySelectorAll('.audible').length).toEqual(0);
  });

  it('renders with audible setting enabled, then removes it', () => { // ids-text audible
    document.body.innerHTML = '';
    const templateElem = document.createElement('template');
    templateElem.innerHTML = '<ids-text audible>Hello World, Can you hear me?</ids-text>';
    elem = templateElem.content.childNodes[0];
    document.body.appendChild(elem);
    expect(elem.shadowRoot.querySelectorAll('.audible').length).toEqual(1);
    elem.audible = false;
    expect(elem.shadowRoot.querySelectorAll('.audible').length).toEqual(0);
  });
});
