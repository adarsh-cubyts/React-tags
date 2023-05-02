import React, { useEffect, useRef, useState, Fragment, memo } from 'react';
import { createRoot } from 'react-dom/client';
import { debounce, size } from 'lodash';
import './style.css';

function App({ data }) {
  const visibleTags = useRef(data);
  const hiddenTags = useRef([]);
  const ref = useRef(null);
  const [renderCount, setRenderCount] = useState(0);
  const [widths, setWidths] = useState([]);
  const hiddenTagsCount = useRef('0');

  useEffect(() => {
    if (size(widths) > 0) {
      const element = document.getElementById('child-main');
      new ResizeObserver(callback).observe(element.parentElement);
      processTags({ data, initalRender: true });
    }
  }, [widths]);

  useEffect(() => {
    hiddenTagsCount.current = getCount(data);
    setWidths(calculateTagsWidths());
  }, [data]);

  const getCount = (data) => {
    let str = '',
      dataLength = data.length;
    for (let i = 0; i < ('' + dataLength).length; i += 1) {
      str += '0';
    }
    return str;
  };

  const calculateTagsWidths = () => {
    const calculatedWidths = [];
    for (const item of ref.current.children) {
      calculatedWidths.push({
        id: item.getAttribute('data-id'),
        offsetWidth: item.offsetWidth,
        scrollWidth: item.scrollWidth,
        clientWidth: item.clientWidth,
        marginRight: parseInt(window.getComputedStyle(item).marginRight, 10),
        marginLeft: parseInt(window.getComputedStyle(item).marginLeft, 10),
      });
    }
    return calculatedWidths;
  };

  let entriesSeen = new Set();
  const callback = (entries) => {
    for (let entry of entries) {
      if (!entriesSeen.has(entry.target)) {
        entriesSeen.add(entry.target);
      } else {
        processTags({ data });
      }
    }
  };

  const processTags = ({ data, initalRender = false }) => {
    if (data.length > 0) {
      calculateTags(initalRender);
    }
  };

  const setTags = debounce(() => {
    setRenderCount((prevCount) => (prevCount += 1));
  }, 200);

  function calculateTags(initalRender) {
    let currentCalculatedWidthOfChild = 50,
      count = -1;
    for (const item of widths) {
      if (currentCalculatedWidthOfChild < ref.current.offsetWidth) {
        count++;
        currentCalculatedWidthOfChild +=
          item.offsetWidth + item.marginRight + item.marginLeft;
      } else {
        break;
      }
    }
    if (initalRender) {
      const tagsToShow = data.slice(0, count);
      const tagsToHide = data.slice(count, data.length);
      if (count > -1) {
        visibleTags.current = tagsToShow;
        hiddenTags.current = tagsToHide;
        setTags();
      }
    } else if (count !== visibleTags.current.length) {
      const tagsToShow = data.slice(0, count);
      const tagsToHide = data.slice(count, data.length);
      if (count > -1) {
        visibleTags.current = tagsToShow;
        hiddenTags.current = tagsToHide;
        setTags();
      }
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        resize: 'horizontal',
        overflow: 'auto',
        border: '1px solid',
        width: 300,
        alignItems: 'center',
        padding: 10
      }}
    >
      <div
        style={{
          background: '#ff00007a',
          color: 'red',
          fontSize: 10,
          padding: '2px 4px',
          fontWeight: 500,
          margin: '0 10px',
          whiteSpace: 'nowrap'
        }}
      >
        Stable Tag
      </div>
      <div
        style={{
          overflow: 'auto',
          flexGrow: 1,
        }}
      >
        <div
          id="child-main"
          ref={ref}
          style={{ overflow: 'hidden', display: 'flex', alignItems: 'center' }}
        >
          {visibleTags.current.map((item) => (
            <div data-id={item} key={item}>
              {item}
            </div>
          ))}
          <div
            data-id={'ellipses'}
            style={hiddenTags.current.length === 0 ? { display: 'none' } : {}}
          >
            {' + '}
            {hiddenTags.current.length || hiddenTagsCount.current}
          </div>
        </div>
      </div>
    </div>
  );
}

const AppWrapper = memo(App);

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWrapper data={['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5']} />
  </React.StrictMode>
);
