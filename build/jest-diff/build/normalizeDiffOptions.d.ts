/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { DiffOptions, DiffOptionsNormalized } from './types';
export declare const noColor: (string: string) => string;
export declare const normalizeDiffOptions: (options?: DiffOptions) => DiffOptionsNormalized;
