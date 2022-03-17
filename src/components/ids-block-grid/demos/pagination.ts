// Example for populating the BlockGrid
import '../ids-block-grid';

const blockGrid = document.querySelector('ids-block-grid');

(async function init() {
  // Do an ajax request
  // const url = '/data/products.json';
  // const response = await fetch(url);
  // const data = await response.json();

  const data = [
    {
      id: 1,
      url: '../assets/images/placeholder-200x200.png',
      name: 'Sheena Taylor1',
      title: 'Infor, Developer'
    },
    {
      id: 2,
      url: '../assets/images/placeholder-200x200.png',
      name: 'Sheena Taylor2',
      title: 'Infor, Developer'
    },
    {
      id: 3,
      url: '../assets/images/placeholder-200x200.png',
      name: 'Sheena Taylor3',
      title: 'Infor, Developer'
    },
    {
      id: 4,
      url: '../assets/images/placeholder-200x200.png',
      name: 'Sheena Taylor4',
      title: 'Infor, Developer'
    },
    {
      id: 5,
      url: '../assets/images/placeholder-200x200.png',
      name: 'Sheena Taylor5',
      title: 'Infor, Developer'
    },
    {
      id: 6,
      url: '../assets/images/placeholder-200x200.png',
      name: 'Sheena Taylor6',
      title: 'Infor, Developer'
    },
    {
      id: 7,
      url: '../assets/images/placeholder-200x200.png',
      name: 'Sheena Taylor7',
      title: 'Infor, Developer'
    },
    {
      id: 8,
      url: '../assets/images/placeholder-200x200.png',
      name: 'Sheena Taylor8',
      title: 'Infor, Developer'
    },
    {
      id: 9,
      url: '../assets/images/placeholder-200x200.png',
      name: 'Sheena Taylor9',
      title: 'Infor, Developer'
    },
    {
      id: 10,
      url: '../assets/images/placeholder-200x200.png',
      name: 'Sheena Taylor10',
      title: 'Infor, Developer'
    },
    {
      id: 11,
      url: '../assets/images/placeholder-200x200.png',
      name: 'Sheena Taylor11',
      title: 'Infor, Developer'
    }
  ];

  // @ts-ignore
  blockGrid.data = data;

  // @ts-ignore
  blockGrid.pager.addEventListener('pagenumberchange', async (e: { detail: { value: any; }; }) => {
    console.info(`standalone page # ${e.detail.value}`);
  });

  console.info('Loading Time:', window.performance.now());
  // @ts-ignore
  console.info('Page Memory:', window.performance.memory);
}());
