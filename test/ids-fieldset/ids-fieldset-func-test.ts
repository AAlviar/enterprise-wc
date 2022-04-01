/**
 * @jest-environment jsdom
 */
import IdsFieldset from '../../src/components/ids-fieldset/ids-fieldset';

describe('IdsFieldset Component', () => {
  let fieldset: any;

  beforeEach(async () => {
    const elem: any = new IdsFieldset();
    document.body.appendChild(elem);
    fieldset = document.querySelector('ids-fieldset');
  });

  afterEach(async () => {
    document.body.innerHTML = '';
  });

  it('renders with no errors', () => {
    const errors = jest.spyOn(global.console, 'error');
    const elem: any = new IdsFieldset();
    document.body.appendChild(elem);
    elem.remove();
    expect(document.querySelectorAll('ids-fieldset').length).toEqual(1);
    expect(errors).not.toHaveBeenCalled();
  });

  it('renders correctly', () => {
    expect(fieldset.outerHTML).toMatchSnapshot();
  });
});
