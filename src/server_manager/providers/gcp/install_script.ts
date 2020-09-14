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

export const SCRIPT =
    "\n(base64 --decode | tar --extract --gzip ) <<EOM\n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\nEOM\n./gcp_install_server.sh\n";