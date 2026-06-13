export default async function handler(req, res) {
    // 1. Check if the PIN sent from the laptop matches the hidden PIN in Vercel
    const clientPin = req.headers['x-pin'];
    if (clientPin !== process.env.MY_PIN) {
        return res.status(401).json({ error: 'Unauthorized: Wrong PIN' });
    }

    const { GITHUB_TOKEN, GIST_ID } = process.env;
    const githubUrl = `https://api.github.com/gists/${GIST_ID}`;

    try {
        // If it's a GET request, LOAD data from GitHub
        if (req.method === 'GET') {
            const githubRes = await fetch(githubUrl, {
                headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
            });
            const data = await githubRes.json();
            return res.status(200).json(data);
        }

        // If it's a POST request, SYNC data to GitHub
        if (req.method === 'POST') {
            const githubRes = await fetch(githubUrl, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files: { 'workspace.json': { content: JSON.stringify(req.body) } }
                })
            });
            const data = await githubRes.json();
            return res.status(200).json(data);
        }
    } catch (error) {
        return res.status(500).json({ error: 'GitHub API Error' });
    }
}
