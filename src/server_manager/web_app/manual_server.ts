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

import {hexToString} from '../infrastructure/hex_encoding';
import * as server from '../model/server';

import {ShadowboxServer} from './shadowbox_server';

class ManualServer extends ShadowboxServer implements server.ManualServer {
  constructor(
      private name: string, private apiUrl: string, private certSha256: string,
      private forgetCallback: Function) {
    super();
    this.setManagementApiUrl(apiUrl);
    // manualServerConfig.certSha256 is expected to be in hex format (install script).
    // Electron requires that this be decoded from hex (to unprintable binary),
    // then encoded as base64.
    try {
      trustCertificate(btoa(hexToString(certSha256)));
    } catch (e) {
      // Error trusting certificate, may be due to bad user input.
      console.error('Error trusting certificate');
    }
  }

  getCertificateFingerprint() {
    return this.certSha256;
  }

  forget(): void {
    this.forgetCallback(this);
  }
}

interface PersistedManualServer {
  name: string;
  apiUrl: string;
  certSha256: string;
}

export class ManualServerRepository implements server.ManualServerRepository {
  private servers: server.ManualServer[] = [];

  constructor(private storageKey: string) {
    this.loadServers();
  }

  addServer(config: server.ManualServerConfig): Promise<server.ManualServer> {
    const existingServer = this.findServer(config);
    if (!!existingServer) {
      console.debug('server already added');
      return Promise.resolve(existingServer);
    }

    const hostname = new URL(config.apiUrl).hostname;
    const server = this.createServer(hostname, config.apiUrl, config.certSha256);
    this.servers.push(server);
    this.storeServers();
    return Promise.resolve(server);
  }

  listServers(): Promise<server.ManualServer[]> {
    return Promise.resolve(this.servers);
  }

  findServer(config: server.ManualServerConfig): server.ManualServer|undefined {
    return this.servers.find(server => server.getManagementApiUrl() === config.apiUrl);
  }

  private loadServers() {
    this.servers = [];
    const serversJson = localStorage.getItem(this.storageKey);
    if (serversJson) {
      try {
        const serverConfigs = JSON.parse(serversJson);
        this.servers = serverConfigs.map((persistedServer: PersistedManualServer) => {
          return this.createServer(
              persistedServer.name, persistedServer.apiUrl, persistedServer.certSha256);
        });
      } catch (e) {
        console.error('Error creating manual servers from localStorage');
      }
    }
  }

  private async storeServers() {
    const persistences: PersistedManualServer[] =
        await Promise.all(this.servers.map(async (server) => {
          return {
            name: server.getName(),
            apiUrl: server.getManagementApiUrl(),
            certSha256: server.getCertificateFingerprint()
          };
        }));
    localStorage.setItem(this.storageKey, JSON.stringify(persistences));
  }

  private createServer(name: string, apiUrl: string, certSha256: string) {
    return new ManualServer(name, apiUrl, certSha256, this.forgetServer.bind(this));
  }

  private forgetServer(server: server.ManualServer): void {
    const apiUrl = server.getManagementApiUrl();
    this.servers = this.servers.filter((server) => {
      return apiUrl !== server.getManagementApiUrl();
    });
    this.storeServers();
  }
}
