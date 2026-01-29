import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: ".env.local" });

async function main() {
    console.log('🚀 Test Chat (Integration Mode) started');

    const message = "What is Next.js?";
    console.log(`❓ User Message: ${message}`);
    console.log('📡 Sending request to http://localhost:3000/api/chat ...');

    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'user', content: message }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        if (!response.body) {
            throw new Error("Response body is null");
        }

        console.log("📝 Stream Output:");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            process.stdout.write(chunk);
        }

        console.log("\n✅ Done!");

    } catch (e) {
        console.error("❌ Error:", e);
        console.log("💡 Tip: Make sure your Next.js server is running (npm run dev)!");
    }
}

main().catch(console.error);
