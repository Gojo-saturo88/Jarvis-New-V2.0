/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GitHubDeployProgress {
  step: 'idle' | 'authenticating' | 'checking_repo' | 'uploading' | 'committing' | 'success' | 'error';
  message: string;
  progressPercent: number;
  repoUrl?: string;
  error?: string;
}

export async function deployToGitHub(
  token: string,
  owner: string,
  repo: string,
  files: Record<string, string>,
  commitMessage: string,
  onProgress: (progress: GitHubDeployProgress) => void
): Promise<string> {
  const cleanToken = token.trim();
  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();

  if (!cleanToken) {
    throw new Error('Please provide your GitHub Personal Access Token (PAT).');
  }
  if (!cleanOwner || !cleanRepo) {
    throw new Error('Please provide both GitHub username and repository name.');
  }

  const headers = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  // 1. Authenticate & Verify User
  onProgress({
    step: 'authenticating',
    message: 'Verifying GitHub credentials & permissions...',
    progressPercent: 10,
  });

  const userRes = await fetch('https://api.github.com/user', { headers });
  if (!userRes.ok) {
    throw new Error(
      `GitHub Authentication Failed (${userRes.status}). Check that your Personal Access Token is valid and has "repo" scope.`
    );
  }
  const userData = await userRes.json();
  const authenticatedUser = userData.login;

  // 2. Check if repository exists, if not attempt to create it
  onProgress({
    step: 'checking_repo',
    message: `Checking repository "${cleanOwner}/${cleanRepo}"...`,
    progressPercent: 20,
  });

  let repoRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, { headers });
  
  if (repoRes.status === 404) {
    // Attempt auto-creation if owner is current user
    if (authenticatedUser.toLowerCase() === cleanOwner.toLowerCase()) {
      onProgress({
        step: 'checking_repo',
        message: `Repository not found. Creating new repository "${cleanRepo}" on GitHub...`,
        progressPercent: 25,
      });

      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: cleanRepo,
          description: 'JARVIS 4.0 - Iron Man Futuristic AI Assistant with 3D Holographic Globe and Android Companion',
          private: false,
          auto_init: true,
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(`Could not create repository: ${errData.message || createRes.statusText}`);
      }

      // Short delay for GitHub propagation
      await new Promise((r) => setTimeout(r, 1500));
      repoRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, { headers });
    } else {
      throw new Error(
        `Repository ${cleanOwner}/${cleanRepo} not found. Please verify the exact repository name and owner username.`
      );
    }
  }

  const repoInfo = await repoRes.json();
  const defaultBranch = repoInfo.default_branch || 'main';

  // 3. Get latest commit SHA for base
  let parentCommitSha: string | null = null;
  const refRes = await fetch(
    `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/ref/heads/${defaultBranch}`,
    { headers }
  );

  if (refRes.ok) {
    const refData = await refRes.json();
    parentCommitSha = refData.object.sha;
  }

  // 4. Upload blobs
  onProgress({
    step: 'uploading',
    message: 'Encoding and uploading project source files...',
    progressPercent: 40,
  });

  const fileEntries = Object.entries(files);
  const treeItems: Array<{ path: string; mode: string; type: string; sha: string }> = [];

  let completedFiles = 0;
  for (const [filePath, content] of fileEntries) {
    const blobRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/blobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: content,
        encoding: 'utf-8',
      }),
    });

    if (!blobRes.ok) {
      const err = await blobRes.json().catch(() => ({}));
      throw new Error(`Failed uploading ${filePath}: ${err.message || blobRes.statusText}`);
    }

    const blobData = await blobRes.json();
    treeItems.push({
      path: filePath,
      mode: '100644',
      type: 'blob',
      sha: blobData.sha,
    });

    completedFiles++;
    const currentProgress = 40 + Math.floor((completedFiles / fileEntries.length) * 35);
    onProgress({
      step: 'uploading',
      message: `Uploaded ${completedFiles}/${fileEntries.length}: ${filePath}`,
      progressPercent: currentProgress,
    });
  }

  // 5. Create Git Tree
  onProgress({
    step: 'committing',
    message: 'Constructing Git tree & snapshot...',
    progressPercent: 80,
  });

  const treeRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      tree: treeItems,
    }),
  });

  if (!treeRes.ok) {
    const err = await treeRes.json().catch(() => ({}));
    throw new Error(`Failed to create Git tree: ${err.message || treeRes.statusText}`);
  }
  const treeData = await treeRes.json();

  // 6. Create Commit
  onProgress({
    step: 'committing',
    message: 'Writing signed JARVIS 4.0 commit...',
    progressPercent: 90,
  });

  const commitPayload: { message: string; tree: string; parents: string[] } = {
    message: commitMessage,
    tree: treeData.sha,
    parents: parentCommitSha ? [parentCommitSha] : [],
  };

  const commitRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify(commitPayload),
  });

  if (!commitRes.ok) {
    const err = await commitRes.json().catch(() => ({}));
    throw new Error(`Failed to commit: ${err.message || commitRes.statusText}`);
  }
  const commitData = await commitRes.json();

  // 7. Update Branch Ref
  onProgress({
    step: 'committing',
    message: `Updating branch "${defaultBranch}" reference...`,
    progressPercent: 95,
  });

  let updateRefRes = await fetch(
    `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs/heads/${defaultBranch}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        sha: commitData.sha,
        force: true,
      }),
    }
  );

  if (updateRefRes.status === 404) {
    // If ref doesn't exist, create it
    updateRefRes = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${defaultBranch}`,
        sha: commitData.sha,
      }),
    });
  }

  if (!updateRefRes.ok) {
    const err = await updateRefRes.json().catch(() => ({}));
    throw new Error(`Failed to update branch head: ${err.message || updateRefRes.statusText}`);
  }

  const finalUrl = repoInfo.html_url || `https://github.com/${cleanOwner}/${cleanRepo}`;

  onProgress({
    step: 'success',
    message: `JARVIS 4.0 deployed successfully to GitHub!`,
    progressPercent: 100,
    repoUrl: finalUrl,
  });

  return finalUrl;
}
