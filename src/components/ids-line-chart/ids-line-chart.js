import { customElement, scss } from '../../core/ids-decorators';

import Base from './ids-line-chart-base';

import styles from './ids-line-chart.scss';

/**
 * IDS Line Chart Component
 * @type {IdsLineChart}
 * @inherits IdsElement
 * @mixes IdsEventsMixin
 * @part container - the outside container element
 */
@customElement('ids-line-chart')
@scss(styles)
export default class IdsLineChart extends Base {
  constructor() {
    super();
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
    if (!this.markerData) {
      return '';
    }

    let points = '';
    let markerHTML = '';
    this.markerData.points.forEach((point) => {
      points += `${point.left},${point.top} `;
      markerHTML += `<circle cx="${point.left}" cy="${point.top}" data-value="${point.value}" r="${this.markerSize}">${point.value}</circle>`;
    });

    return {
      markers: markerHTML,
      lines: `<polyline class="data-line" points="${points}"/>`
    };
  }

  /**
   * Generate the svg markup for the area paths
   * @returns {string} The area markup
   * @private
   */
  #areas() {
    let areas = '';
    this.markerData.points.forEach((point, index) => {
      if (this.markerData.points[index + 1]) {
        areas += `M${point.left},${point.top}L${point.left},${this.markerData.gridBottom}L${this.markerData.points[index + 1]?.left},${this.markerData.gridBottom}L${this.markerData.points[index + 1]?.left},${this.markerData.points[index + 1]?.top}`;
      }
    });
    return `<path d="${areas}Z"></path>`;
  }
}
