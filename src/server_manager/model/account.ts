// Copyright 2018 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {CloudProvider} from './cloud';
import {LocalStorageRepository} from "../infrastructure/repository";
import {CloudProviderService, Location} from "../cloud/cloud_provider_service";

export interface AccountData {
  id: string;
  displayName: string;
  provider: CloudProvider;
  credential: unknown;
}

export type Id = {
  cloudId: CloudProvider;
  userId: string;
};

export class Account {
  constructor(protected account: AccountData,
              protected accountRepository: LocalStorageRepository<AccountData, string>,
              protected cloudProviderService: CloudProviderService) {

  }

  id(): Id {
    return {
      cloudId: this.account.provider,
      userId: this.account.id,
    };
  }

  async listLocations(): Promise<Location[]> {
    return this.cloudProviderService.listLocations();
  }

  async disconnect(): Promise<void> {
    this.accountRepository.remove(this.account.id);
  }
}