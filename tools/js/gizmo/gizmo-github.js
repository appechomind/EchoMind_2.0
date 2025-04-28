class GizmoGitHub {
    constructor() {
        this.baseUrl = 'https://api.github.com';
        this.token = null;
        this.currentRepo = null;
    }

    async initialize(token = null) {
        this.token = token;
        if (!token) {
            // Try to get token from localStorage
            this.token = localStorage.getItem('gizmo_github_token');
        } else {
            localStorage.setItem('gizmo_github_token', token);
        }
    }

    async analyzeRepository(url) {
        try {
            // Extract owner and repo from GitHub URL
            const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (!match) throw new Error('Invalid GitHub URL');

            const [_, owner, repo] = match;
            this.currentRepo = { owner, repo };

            // Get repository information
            const repoInfo = await this.fetchRepoInfo();
            const branches = await this.fetchBranches();
            const languages = await this.fetchLanguages();
            const contributors = await this.fetchContributors();

            return {
                repoInfo,
                branches,
                languages,
                contributors,
                analysis: this.generateRepoAnalysis({
                    repoInfo,
                    branches,
                    languages,
                    contributors
                })
            };
        } catch (error) {
            console.error('GitHub analysis error:', error);
            throw error;
        }
    }

    async fetchRepoInfo() {
        const response = await this.githubFetch(`/repos/${this.currentRepo.owner}/${this.currentRepo.repo}`);
        return response;
    }

    async fetchBranches() {
        const response = await this.githubFetch(`/repos/${this.currentRepo.owner}/${this.currentRepo.repo}/branches`);
        return response;
    }

    async fetchLanguages() {
        const response = await this.githubFetch(`/repos/${this.currentRepo.owner}/${this.currentRepo.repo}/languages`);
        return response;
    }

    async fetchContributors() {
        const response = await this.githubFetch(`/repos/${this.currentRepo.owner}/${this.currentRepo.repo}/contributors`);
        return response;
    }

    async searchCode(query) {
        const response = await this.githubFetch('/search/code', {
            q: `${query} repo:${this.currentRepo.owner}/${this.currentRepo.repo}`
        });
        return response.items;
    }

    async getFileContent(path) {
        const response = await this.githubFetch(`/repos/${this.currentRepo.owner}/${this.currentRepo.repo}/contents/${path}`);
        return Buffer.from(response.content, 'base64').toString();
    }

    generateRepoAnalysis(data) {
        const analysis = {
            summary: `This is a ${data.repoInfo.private ? 'private' : 'public'} repository with ${data.repoInfo.stargazers_count} stars.`,
            activity: `Last updated ${new Date(data.repoInfo.updated_at).toLocaleDateString()}.`,
            size: `Repository size: ${(data.repoInfo.size / 1024).toFixed(2)} MB`,
            languages: `Main languages: ${Object.keys(data.languages).join(', ')}`,
            contributors: `${data.contributors.length} contributors`,
            suggestions: []
        };

        // Generate suggestions based on repository state
        if (!data.repoInfo.description) {
            analysis.suggestions.push('Add a repository description');
        }
        if (!data.repoInfo.homepage) {
            analysis.suggestions.push('Consider adding a homepage URL');
        }
        if (data.repoInfo.open_issues_count > 10) {
            analysis.suggestions.push('Consider addressing open issues');
        }

        return analysis;
    }

    async githubFetch(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseUrl);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                url.searchParams.append(key, value);
            });
        }

        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };

        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }

        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        return response.json();
    }

    async createIssue(title, body) {
        const response = await this.githubFetch(
            `/repos/${this.currentRepo.owner}/${this.currentRepo.repo}/issues`,
            {
                method: 'POST',
                body: JSON.stringify({ title, body })
            }
        );
        return response;
    }

    async createPullRequest(title, body, head, base = 'main') {
        const response = await this.githubFetch(
            `/repos/${this.currentRepo.owner}/${this.currentRepo.repo}/pulls`,
            {
                method: 'POST',
                body: JSON.stringify({ title, body, head, base })
            }
        );
        return response;
    }

    async suggestChanges(files) {
        // Create a new branch for changes
        const branchName = `gizmo-suggestions-${Date.now()}`;
        await this.createBranch(branchName);

        // Commit changes to the new branch
        for (const [path, content] of Object.entries(files)) {
            await this.commitFile(path, content, 'Gizmo AI suggested changes', branchName);
        }

        // Create pull request
        return this.createPullRequest(
            'Gizmo AI Suggested Changes',
            'These changes were suggested by Gizmo AI to improve code quality and maintainability.',
            branchName
        );
    }

    async createBranch(name) {
        const mainRef = await this.githubFetch(`/repos/${this.currentRepo.owner}/${this.currentRepo.repo}/git/ref/heads/main`);
        await this.githubFetch(
            `/repos/${this.currentRepo.owner}/${this.currentRepo.repo}/git/refs`,
            {
                method: 'POST',
                body: JSON.stringify({
                    ref: `refs/heads/${name}`,
                    sha: mainRef.object.sha
                })
            }
        );
    }

    async commitFile(path, content, message, branch) {
        // Get current file (if exists)
        let currentFile;
        try {
            currentFile = await this.githubFetch(
                `/repos/${this.currentRepo.owner}/${this.currentRepo.repo}/contents/${path}`
            );
        } catch (e) {
            // File doesn't exist yet
        }

        await this.githubFetch(
            `/repos/${this.currentRepo.owner}/${this.currentRepo.repo}/contents/${path}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    message,
                    content: Buffer.from(content).toString('base64'),
                    sha: currentFile?.sha,
                    branch
                })
            }
        );
    }
}

// Initialize GitHub integration
const gizmoGitHub = new GizmoGitHub(); 