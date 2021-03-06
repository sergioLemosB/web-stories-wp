/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import { renderHook, act } from '@testing-library/react-hooks';

/**
 * Internal dependencies
 */
import useFetchMediaEffect from '../useFetchMediaEffect';

const mockListMedia = jest.fn();
const mockListCategoryMedia = jest.fn();

jest.mock('../api', () => ({
  useMedia3pApi: () => ({
    actions: {
      listMedia: mockListMedia,
      listCategoryMedia: mockListCategoryMedia,
    },
  }),
}));

describe('useFetchMediaEffect', () => {
  let fetchMediaStart;
  let fetchMediaSuccess;
  let fetchMediaError;

  beforeEach(() => {
    mockListMedia.mockReset();
    fetchMediaStart = jest.fn();
    fetchMediaSuccess = jest.fn();
    fetchMediaError = jest.fn();
  });

  function renderUseFetchMediaEffect(propertyOverrides) {
    act(() => {
      renderHook(() => {
        useFetchMediaEffect({
          provider: 'unsplash',
          selectedProvider: 'unsplash',
          pageToken: 'pageToken',
          fetchMediaStart,
          fetchMediaSuccess,
          fetchMediaError,
          ...propertyOverrides,
        });
      });
    });
  }

  it('should fetch media when the provider is set and not search term', async () => {
    mockListMedia.mockImplementation(() =>
      Promise.resolve({ media: [{ id: 1 }], nextPageToken: 'nextPageToken' })
    );

    await renderUseFetchMediaEffect();

    expect(fetchMediaStart).toHaveBeenCalledWith({
      provider: 'unsplash',
      pageToken: 'pageToken',
    });
    expect(mockListMedia).toHaveBeenCalledWith({
      provider: 'unsplash',
      searchTerm: undefined,
      pageToken: 'pageToken',
    });
    expect(fetchMediaSuccess).toHaveBeenCalledWith({
      provider: 'unsplash',
      media: [{ id: 1 }],
      nextPageToken: 'nextPageToken',
      pageToken: 'pageToken',
    });
  });

  it('should fetch media when the provider is set and search term', async () => {
    mockListMedia.mockImplementation(() =>
      Promise.resolve({ media: [{ id: 1 }], nextPageToken: 'nextPageToken' })
    );

    await renderUseFetchMediaEffect({ searchTerm: 'cat' });

    expect(fetchMediaStart).toHaveBeenCalledWith({
      provider: 'unsplash',
      pageToken: 'pageToken',
    });
    expect(mockListMedia).toHaveBeenCalledWith({
      provider: 'unsplash',
      searchTerm: 'cat',
      pageToken: 'pageToken',
    });
    expect(fetchMediaSuccess).toHaveBeenCalledWith({
      provider: 'unsplash',
      media: [{ id: 1 }],
      nextPageToken: 'nextPageToken',
      pageToken: 'pageToken',
    });
  });

  it('should fetch media when the provider is set and category id', async () => {
    mockListCategoryMedia.mockImplementation(() =>
      Promise.resolve({ media: [{ id: 1 }], nextPageToken: 'nextPageToken' })
    );

    await renderUseFetchMediaEffect({ selectedCategoryId: 'category/1' });

    expect(fetchMediaStart).toHaveBeenCalledWith({
      provider: 'unsplash',
      pageToken: 'pageToken',
    });
    expect(mockListCategoryMedia).toHaveBeenCalledWith({
      provider: 'unsplash',
      selectedCategoryId: 'category/1',
      pageToken: 'pageToken',
    });
    expect(fetchMediaSuccess).toHaveBeenCalledWith({
      provider: 'unsplash',
      media: [{ id: 1 }],
      nextPageToken: 'nextPageToken',
      pageToken: 'pageToken',
    });
  });

  it('should call fetchMediaError if the fetch has failed', async () => {
    mockListMedia.mockImplementation(() => Promise.error(new Error()));

    await renderUseFetchMediaEffect();

    expect(fetchMediaStart).toHaveBeenCalledTimes(1);
    expect(fetchMediaSuccess).not.toHaveBeenCalledWith();
    expect(fetchMediaError).toHaveBeenCalledTimes(1);
  });

  it('should not fetch media if the provider is not the same as selected provider', async () => {
    await renderUseFetchMediaEffect({
      provider: 'coverr',
      selectedProvider: 'unsplash',
    });
    expect(fetchMediaStart).not.toHaveBeenCalledTimes(1);
  });
});
