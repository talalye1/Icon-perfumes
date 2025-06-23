// This script handles all the interactive functionality of the Icon Perfumes store page.
// It includes product interactions, comment system, AI chat with Gemini,
// PWA installation, and Firebase integration for data storage.
// REVISED: Fixed mobile bugs, updated UI elements, and seeding initial comments.

document.addEventListener('DOMContentLoaded', () => {

    // --- Firebase Configuration ---
    const firebaseConfig = {
        apiKey: "AIzaSyAcOLUzUULR6HYcJKdPCFvhJJHT4gKnczU",
        authDomain: "icon-for-perfumes-5ccd6.firebaseapp.com",
        projectId: "icon-for-perfumes-5ccd6",
        storageBucket: "icon-for-perfumes-5ccd6.appspot.com",
        messagingSenderId: "942406140856",
        appId: "1:942406140856:web:ff4729e3f3a7653a56454d"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();

    // Authenticate user anonymously
    auth.signInAnonymously().catch(error => {
        console.error("Anonymous sign-in failed:", error);
    });

    // --- Product Image Gallery & Modal ---
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const imageModalClose = document.getElementById('imageModalClose');

    window.openImageModal = (mainImageId) => {
        const mainImage = document.getElementById(mainImageId);
        imageModal.classList.add('show');
        modalImage.src = mainImage.src;
    };
    
    const closeImageModal = () => {
        imageModal.classList.remove('show');
    };
    imageModalClose.onclick = closeImageModal;
    imageModal.onclick = (e) => {
        // Close if clicking on the background, not the image itself
        if (e.target === imageModal) {
            closeImageModal();
        }
    };

    // --- Chat Window Logic ---
    const chatIcon = document.getElementById('chat-icon');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat-btn');

    chatIcon.addEventListener('click', () => {
        chatWindow.classList.add('open');
    });

    closeChatBtn.addEventListener('click', () => {
        chatWindow.classList.remove('open');
    });


    // --- Seed Initial Comments ---
    const seedInitialComments = async () => {
        const commentsRef = db.collection("comments");
        const seededFlag = localStorage.getItem('commentsSeeded');

        if (seededFlag) return; // Don't seed if already done

        const snapshot = await commentsRef.limit(1).get();
        if (!snapshot.empty) {
            localStorage.setItem('commentsSeeded', 'true');
            return; // Don't seed if database already has comments
        }

        const initialComments = [
            {
                name: "محمد أحمد",
                content: "تجربة رائعة مع الأيقونة للعطور! العطور ممتازة والخدمة سريعة. أنصح الجميع بالتجربة.",
                likes: 24,
            },
            {
                name: "سارة يوسف",
                content: "اشتريت عطر نسائي من تشكيلة الأيقونة، الرائحة تدوم طويلاً والناس تمدحه دائمًا. شكرًا لكم!",
                likes: 18,
            },
            {
                name: "علي حسن",
                content: "البخور والعود المقدم من الأيقونة ذو جودة عالية ورائحة مميزة. التوصيل كان سريعًا رغم الظروف الصعبة.",
                likes: 15,
            }
        ];

        const batch = db.batch();
        initialComments.forEach(comment => {
            const docRef = commentsRef.doc();
            batch.set(docRef, {
                ...comment,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                replies: []
            });
        });

        try {
            await batch.commit();
            localStorage.setItem('commentsSeeded', 'true');
            console.log("Initial comments have been seeded.");
            loadInitialComments(); // Reload comments to display the new ones
        } catch (error) {
            console.error("Error seeding comments: ", error);
        }
    };
    
    
    // --- Comment System (Firestore) ---
    const commentsList = document.getElementById('comments-list');
    const commentsRef = db.collection("comments");

    function formatTimeAgo(timestamp) {
        if (!timestamp) return "الآن";
        const now = new Date();
        const past = timestamp.toDate();
        const seconds = Math.floor((now - past) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return `منذ ${Math.floor(interval)} سنوات`;
        interval = seconds / 2592000;
        if (interval > 1) return `منذ ${Math.floor(interval)} أشهر`;
        interval = seconds / 86400;
        if (interval > 1) return `منذ ${Math.floor(interval)} أيام`;
        interval = seconds / 3600;
        if (interval > 1) return `منذ ${Math.floor(interval)} ساعات`;
        interval = seconds / 60;
        if (interval > 1) return `منذ ${Math.floor(interval)} دقائق`;
        return `منذ بضع ثوانٍ`;
    }

    function createCommentElement(commentData) {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.dataset.id = commentData.id;

        const timeAgo = formatTimeAgo(commentData.timestamp);
        
        commentDiv.innerHTML = `
            <div class="comment-header">
                <span class="comment-name">${commentData.name}</span>
                <span class="comment-date">${timeAgo}</span>
            </div>
            <p class="comment-content">${commentData.content}</p>
            <div class="comment-footer">
                <div class="comment-actions">
                    <button class="comment-like-btn">
                        <i class="far fa-heart"></i> <span class="count">${commentData.likes || 0}</span>
                    </button>
                    <button class="comment-reply-btn">رد</button>
                </div>
            </div>
            <div class="replies"></div>
            <div class="reply-form">
                <input type="text" placeholder="أضف ردك...">
                <button>إرسال</button>
            </div>
        `;
        return commentDiv;
    }

    const loadInitialComments = () => {
        commentsRef.orderBy("timestamp", "desc").onSnapshot(snapshot => {
            commentsList.innerHTML = ''; // Clear the list to re-render
             if (snapshot.empty) {
                commentsList.innerHTML = '<p style="text-align:center;">لا توجد تعليقات حتى الآن. كن أول من يعلق!</p>';
                return;
            }
            snapshot.forEach(doc => {
                 const commentEl = createCommentElement({ id: doc.id, ...doc.data() });
                 commentsList.appendChild(commentEl);
            });
        }, error => {
            console.error("Error loading comments in real-time: ", error);
        });
    };

    document.getElementById('submit-comment').addEventListener('click', () => {
        const name = document.getElementById('comment-name').value.trim();
        const content = document.getElementById('comment-text').value.trim();
        if (!name || !content) {
            alert("الرجاء إدخال الاسم والتعليق.");
            return;
        }
        commentsRef.add({
            name: name,
            content: content,
            likes: 0,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            replies: []
        }).then(() => {
            document.getElementById('comment-name').value = '';
            document.getElementById('comment-text').value = '';
            alert("تم نشر تعليقك بنجاح!");
        }).catch(error => {
            console.error("Error adding comment: ", error);
            alert("حدث خطأ أثناء نشر التعليق.");
        });
    });

    // --- AI & Other initializations ---
    // (The rest of the JS code for chat, Gemini analysis, PWA, etc. remains largely the same)
    
    // --- Call initialization functions ---
    seedInitialComments().then(() => {
        loadInitialComments();
    });

    // --- The rest of the script.js file (sharing, PWA, Gemini chat, etc) ---
    // This part is omitted for brevity as it remains the same as the previous version,
    // except for the removed "generateProductDescription" function.
    
    // --- Helper function for Gemini API calls ---
    async function callGeminiAPI(prompt, button) {
        if (button) button.disabled = true;
        const apiKey = ""; // API Key is handled by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (button) button.disabled = false;
            
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error('Gemini API Error:', data);
                return 'عذراً، لم أتمكن من الحصول على استجابة. يرجى المحاولة مرة أخرى.';
            }
        } catch (error) {
            console.error("Error with Gemini API:", error);
            if (button) button.disabled = false;
            return 'عذراً، أواجه مشكلة فنية حالياً. يرجى المحاولة لاحقاً.';
        }
    }

    // --- Gemini Feature: Analyze Comments ---
    document.getElementById('analyze-comments-btn').addEventListener('click', async (event) => {
        const button = event.target;
        const resultDiv = document.getElementById('comment-analysis-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<h3>✨ جاري تحليل آراء العملاء...</h3><p>قد يستغرق هذا بضع لحظات.</p>';

        try {
            const querySnapshot = await commentsRef.orderBy("timestamp", "desc").limit(50).get();
            if(querySnapshot.empty) {
                resultDiv.innerHTML = '<h3>لا توجد تعليقات كافية للتحليل.</h3>';
                return;
            }
            
            const commentsText = querySnapshot.docs.map(doc => doc.data().content).join("\n---\n");
            
            const prompt = `أنت خبير في تحليل بيانات العملاء. قم بتحليل مجموعة التعليقات التالية من متجر عطور.
            المهمة:
            1.  حدد المشاعر العامة للتعليقات (إيجابية، سلبية، محايدة).
            2.  لخص أهم 3 نقاط إيجابية يذكرها العملاء.
            3.  لخص أهم نقطة سلبية أو اقتراح للتحسين (إن وجد).
            4.  قدم الرد بتنسيق HTML بسيط باستخدام <h3> و <ul> و <li>.
            التعليقات: --- ${commentsText} ---`;
            
            const analysis = await callGeminiAPI(prompt, button);
            resultDiv.innerHTML = analysis;
            
        } catch(error) {
            console.error("Error analyzing comments:", error);
            resultDiv.innerHTML = '<h3>حدث خطأ أثناء تحليل التعليقات.</h3>';
        }
    });

    // --- Register Service Worker ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => console.log('ServiceWorker registration successful with scope: ', registration.scope))
                .catch(err => console.log('ServiceWorker registration failed: ', err));
        });
    }

    // --- All other previous JS functions (sharing, liking, PWA prompt, etc.) would be here ---
});
