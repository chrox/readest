import clsx from 'clsx';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { BiMoon, BiSun } from 'react-icons/bi';
import { TbSunMoon } from 'react-icons/tb';
import { MdZoomOut, MdZoomIn, MdCheck } from 'react-icons/md';

import { ONE_COLUMN_MAX_INLINE_SIZE } from '@/services/constants';
import MenuItem from '@/components/MenuItem';
import { useReaderStore } from '@/store/readerStore';
import { useTheme, ThemeMode } from '@/hooks/useTheme';
import { getStyles } from '@/utils/style';

interface ViewMenuProps {
  bookKey: string;
  setIsDropdownOpen?: (open: boolean) => void;
  onSetSettingsDialogOpen: (open: boolean) => void;
}

const ViewMenu: React.FC<ViewMenuProps> = ({
  bookKey,
  setIsDropdownOpen,
  onSetSettingsDialogOpen,
}) => {
  const { getView, getViews, getViewSettings, setViewSettings } = useReaderStore();
  const viewSettings = getViewSettings(bookKey)!;

  const { themeMode, isDarkMode, themeCode, updateThemeMode } = useTheme();
  const [isScrolledMode, setScrolledMode] = useState(viewSettings!.scrolled);
  const [isInvertedColors, setInvertedColors] = useState(viewSettings!.invert);
  const [zoomLevel, setZoomLevel] = useState(viewSettings!.zoomLevel!);

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 200));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 50));
  const resetZoom = () => setZoomLevel(100);
  const toggleScrolledMode = () => setScrolledMode(!isScrolledMode);
  const toggleInvertedColors = () => setInvertedColors(!isInvertedColors);

  const openFontLayoutMenu = () => {
    setIsDropdownOpen?.(false);
    onSetSettingsDialogOpen(true);
  };

  const cycleThemeMode = () => {
    const nextMode: ThemeMode =
      themeMode === 'auto' ? 'light' : themeMode === 'light' ? 'dark' : 'auto';
    updateThemeMode(nextMode);
  };

  useEffect(() => {
    getViews().forEach((view) => {
      view.renderer.setStyles?.(getStyles(viewSettings!, themeCode));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeCode]);

  useEffect(() => {
    getView(bookKey)?.renderer.setAttribute('flow', isScrolledMode ? 'scrolled' : 'paginated');
    getView(bookKey)?.renderer.setAttribute(
      'max-inline-size',
      `${viewSettings.maxColumnCount === 1 || isScrolledMode ? ONE_COLUMN_MAX_INLINE_SIZE : viewSettings.maxInlineSize}px`,
    );
    getView(bookKey)?.renderer.setStyles?.(getStyles(viewSettings!, themeCode));
    viewSettings!.scrolled = isScrolledMode;
    setViewSettings(bookKey, viewSettings!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrolledMode]);

  useEffect(() => {
    document.body.classList.toggle('invert', isInvertedColors);
    getView(bookKey)?.renderer.setStyles?.(getStyles(viewSettings!, themeCode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInvertedColors]);

  useEffect(() => {
    const view = getView(bookKey);
    if (!view) return;
    // FIXME: zoom level is not working in paginated mode
    if (viewSettings?.scrolled) {
      view.renderer.setStyles?.(getStyles(viewSettings!, themeCode));
    }
    viewSettings!.zoomLevel = zoomLevel;
    setViewSettings(bookKey, viewSettings!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomLevel]);

  return (
    <div
      tabIndex={0}
      className='view-menu dropdown-content dropdown-right no-triangle border-base-100 z-20 mt-1 w-72 border shadow-2xl'
    >
      <div
        className={clsx(
          'flex items-center justify-between rounded-md',
          !isScrolledMode && 'text-gray-400',
        )}
      >
        <button
          onClick={zoomOut}
          className={clsx(
            'hover:bg-base-200 text-base-content rounded-full p-2',
            !isScrolledMode && 'btn-disabled text-gray-400',
          )}
        >
          <MdZoomOut size={20} />
        </button>
        <button
          className={clsx(
            'hover:bg-base-200 text-base-content h-8 min-h-8 w-[50%] rounded-md p-1 text-center',
            !isScrolledMode && 'btn-disabled text-gray-400',
          )}
          onClick={resetZoom}
        >
          {zoomLevel}%
        </button>
        <button
          onClick={zoomIn}
          className={clsx(
            'hover:bg-base-200 text-base-content rounded-full p-2',
            !isScrolledMode && 'btn-disabled text-gray-400',
          )}
        >
          <MdZoomIn size={20} />
        </button>
      </div>

      <hr className='border-base-200 my-1' />

      <MenuItem label='Font & Layout' shortcut='Shift+F' onClick={openFontLayoutMenu} />

      <MenuItem
        label='Scrolled Mode'
        shortcut='Shift+J'
        icon={isScrolledMode ? <MdCheck size={20} /> : undefined}
        onClick={toggleScrolledMode}
      />

      <hr className='border-base-200 my-1' />

      <MenuItem
        label={
          themeMode === 'dark' ? 'Dark Mode' : themeMode === 'light' ? 'Light Mode' : 'Auto Mode'
        }
        icon={
          themeMode === 'dark' ? (
            <BiMoon size={20} />
          ) : themeMode === 'light' ? (
            <BiSun size={20} />
          ) : (
            <TbSunMoon size={20} />
          )
        }
        onClick={cycleThemeMode}
      />
      <MenuItem
        label='Invert Colors in Dark Mode'
        icon={isInvertedColors ? <MdCheck size={20} className='text-base-content' /> : undefined}
        onClick={toggleInvertedColors}
        disabled={!isDarkMode}
      />
    </div>
  );
};

export default ViewMenu;
