import { attributes } from '../../core/ids-attributes';
import { customElement, scss } from '../../core/ids-decorators';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';
import Base from './ids-line-chart-base';
import styles from './ids-line-chart.scss';

import type IdsChartData from '../ids-axis-chart/ids-axis-chart';

/**
 * IDS Line Chart Component
 * @type {IdsLineChart}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @part svg - the outside svg element
 * @part marker - the dots/markers in the chart
 * @part line - the lines in the chart
 */
@customElement('ids-line-chart')
@scss(styles)
export default class IdsLineChart extends Base {
  constructor() {
    super();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [
      ...super.attributes,
      attributes.MARKER_SIZE
    ];
  }

  /**
   * Return the chart data for the internal svg
   * @returns {object} The markers and lines
   */
  chartTemplate() {
    return `<g class="markers">
      ${this.lineMarkers().markers}
    </g>
    <g class="marker-lines">
      ${this.lineMarkers().lines}
    </g>`;
  }

  /**
   * Return the marker data for the svg
   * @private
   * @returns {object} The markers and lines
   */
  lineMarkers() {
    let markerHTML = '';
    let lineHTML = '';
    this.markerData.points?.forEach((pointGroup: any, index: number) => {
      let points = '';
      let animationPoints = '';
      markerHTML += '<g class="marker-set">';

      pointGroup.forEach((point: IdsChartData) => {
        points += `${point.left},${point.top} `;
        animationPoints += `${point.left},${this.markerData.gridBottom} `;
        markerHTML += `<circle part="marker" class="color-${index + 1}" cx="${point.left}" cy="${point.top}" data-value="${point.value}" r="${this.markerSize}">
        ${stringToBool(this.animated) ? `<animate attributeName="cy" ${this.cubicBezier} from="${this.markerData.gridBottom}" to="${point.top}"/>` : ''}
        </circle>`;
      });
      markerHTML += '</g>';
      lineHTML += `<polyline part="line" class="data-line color-${index + 1}" points="${points}" stroke="var(${this.color(index)}">
      ${stringToBool(this.animated) ? `<animate attributeName="points" ${this.cubicBezier} from="${animationPoints}" to="${points}" />` : ''}
      </polyline>`;
    });

    return {
      markers: markerHTML,
      lines: lineHTML
    };
  }

  /**
   * Set the size of the markers (aka dots/ticks) in the chart
   * @param {number} value The value to use (in pixels)
   */
  set markerSize(value) {
    this.setAttribute(attributes.MARKER_SIZE, value);
    this.rerender();
  }

  get markerSize() {
    return parseFloat(this.getAttribute(attributes.MARKER_SIZE)) || 5;
  }
}
