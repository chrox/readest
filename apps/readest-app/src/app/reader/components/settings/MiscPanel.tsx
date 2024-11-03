import React, { useEffect, useState } from 'react';
import { useReaderStore } from '@/store/readerStore';
import cssbeautify from 'cssbeautify';
import { getStyles } from '@/utils/style';

const cssRegex =
  /((?:\s*)([\w#.@*,:\-.:>+~\[\]\"=(),*\s]+)\s*{(?:[\s]*)((?:[A-Za-z\- \s]+[:]\s*['"0-9\w .,\/\()\-!#%]+;?)*)*\s*}(?:\s*))/gim;

const MiscPanel: React.FC<{ bookKey: string }> = ({ bookKey }) => {
  const { books, settings, setSettings, setConfig, getFoliateView } = useReaderStore();
  const { isFontLayoutSettingsGlobal } = useReaderStore();
  const bookState = books[bookKey]!;
  const config = bookState.config!;

  const [animated, setAnimated] = useState(config.viewSettings!.animated!);
  const [userStylesheet, setUserStylesheet] = useState(config.viewSettings!.userStylesheet!);
  const [error, setError] = useState<string | null>(null);

  let cssInput = userStylesheet;

  const validateCSS = (css: string) => {
    return cssRegex.test(css);
  };

  const handleUserStylesheetChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    cssInput = e.target.value;

    try {
      const formattedCSS = cssbeautify(cssInput, {
        indent: '  ',
        openbrace: 'end-of-line',
        autosemicolon: true,
      });
      setUserStylesheet(formattedCSS);

      if (cssInput && !validateCSS(cssInput)) {
        throw new Error('Invalid CSS');
      }
      setError(null);

      config.viewSettings!.userStylesheet = formattedCSS;
      setConfig(bookKey, config);
      if (isFontLayoutSettingsGlobal) {
        settings.globalViewSettings.userStylesheet = formattedCSS;
        setSettings(settings);
      }
      getFoliateView(bookKey)?.renderer.setStyles?.(getStyles(config));
    } catch (err) {
      setError('Invalid CSS: Please check your input.');
      console.log('CSS Error:', err);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  useEffect(() => {
    config.viewSettings!.animated = animated;
    setConfig(bookKey, config);
    if (isFontLayoutSettingsGlobal) {
      settings.globalViewSettings.animated = animated;
      setSettings(settings);
    }
    if (animated) {
      getFoliateView(bookKey)?.renderer.setAttribute('animated', '');
    } else {
      getFoliateView(bookKey)?.renderer.removeAttribute('animated');
    }
  }, [animated]);

  return (
    <div className='my-4 w-full space-y-6'>
      <div className='w-full'>
        <h2 className='mb-2 font-medium'>Animation</h2>
        <div className='card bg-base-100 border shadow'>
          <div className='divide-y'>
            <div className='config-item config-item-top config-item-bottom'>
              <span className='text-gray-700'>Paging Animation</span>
              <input
                type='checkbox'
                className='toggle'
                checked={animated}
                onChange={() => setAnimated(!animated)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className='w-full'>
        <h2 className='mb-2 font-medium'>Custom CSS</h2>
        <div className={`card bg-base-100 border shadow ${error ? 'border-red-500' : ''}`}>
          <div className='divide-y'>
            <div className='css-text-area config-item-top config-item-bottom p-1'>
              <textarea
                className='textarea textarea-ghost h-48 w-full border-0 p-3 !outline-none'
                placeholder='Enter your custom CSS here...'
                spellCheck='false'
                value={cssInput}
                onInput={handleInput}
                onKeyDown={handleInput}
                onKeyUp={handleInput}
                onChange={handleUserStylesheetChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiscPanel;