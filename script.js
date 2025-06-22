// This script handles all the interactive functionality of the Icon Perfumes store page.
// It includes product interactions, comment system, AI chat with Gemini,
// PWA installation, and Firebase integration for data storage.
// NEW: Includes Gemini API features for product descriptions and comment analysis.

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

    // --- Global Variables & DOM Elements ---
    const commentsList = document.getElementById('comments-list');
    const submitCommentBtn = document.getElementById('submit-comment');
    const commentNameInput = document.getElementById('comment-name');
    const commentTextInput = document.getElementById('comment-text');
    let lastVisibleComment = null; // For pagination
    const commentsPerPage = 3;

    // --- PWA Installation Logic ---
    let deferredPrompt;
    const installBanner = document.getElementById('pwa-install-banner');
    const installBtn = document.getElementById('pwa-install-btn');
    const detailsBtn = document.getElementById('pwa-details-btn');
    const closeBannerBtn = document.getElementById('pwa-close-btn');
    const detailsModal = document.getElementById('pwa-details-modal');
    const detailsCloseBtn = document.getElementById('pwa-details-close');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBanner.style.display = 'flex';
    });

    installBtn.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                }
                deferredPrompt = null;
            });
        }
        installBanner.style.display = 'none';
    });

    detailsBtn.addEventListener('click', () => {
        detailsModal.style.display = 'block';
    });
    
    closeBannerBtn.addEventListener('click', () => {
        installBanner.style.display = 'none';
    });

    detailsCloseBtn.addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });

    // --- Product Image Gallery ---
    window.showImage = (thumbnail, mainImageId) => {
        const mainImage = document.getElementById(mainImageId);
        mainImage.src = thumbnail.src;
        const thumbnails = thumbnail.parentElement.children;
        for (let i = 0; i < thumbnails.length; i++) {
            thumbnails[i].classList.remove('active');
        }
        thumbnail.classList.add('active');
    };

    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const imageModalClose = document.getElementById('imageModalClose');
    
    window.openImageModal = (mainImageId) => {
        const mainImage = document.getElementById(mainImageId);
        imageModal.style.display = 'block';
        modalImage.src = mainImage.src;
    };
    
    imageModalClose.onclick = () => {
        imageModal.style.display = 'none';
    };

    // --- Interaction Buttons ---
    window.toggleLike = (btn) => {
        btn.classList.toggle('liked');
        const isLiked = btn.classList.contains('liked');
        const heartIcon = btn.querySelector('i');
        const likeCountSpan = btn.querySelector('.like-count');
        let likeCount = parseInt(likeCountSpan.innerText);
        
        if (isLiked) {
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            likeCount++;
        } else {
            heartIcon.classList.remove('fas');
            heartIcon.classList.add('far');
            likeCount--;
        }
        likeCountSpan.innerText = likeCount;
    };

    window.orderProduct = (productName) => {
        const message = `العميل: الاخوه مبيعات الأيقونة للعطور
السلام عليكم ورحمة الله وبركاته
أريد معلومات عن هذا المنتج: ${productName}، هل من الممكن تزويدي بالأسعار لديكم؟ لقد رأيت هذا المنتج على موقعكم على الويب:
https://talalye1.github.io/Icon-perfumes/

أهلاً بك سنقوم بتزويدك بما تريد في أسرع وقت ممكن.

فقط ضع اسمك ورقم هاتفك إذا أمكن ومكان إقامتك أو اسم المحافظة التي تريدنا إرسال طلبك إليها.`;
        const encodedMessage = encodeURIComponent(message);
        const messengerUrl = `https://m.me/alayqwnt.ll.twr?text=${encodedMessage}`;
        window.open(messengerUrl, '_blank');
    };
    
    document.getElementById('designer-contact-btn').addEventListener('click', () => {
        const message = `مصمم التطبيقات والمواقع 
طلال سليمان قايد المقطري 
https://www.facebook.com/talalye2024 
أهلاً بك
أنت قادم من موقع الأيقونة للعطور
هل لديك استفسار أو طلب تصميم؟
اكتب ما هو نوع الاستفسار أو الطلب هنا 👈:`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/+967774662666?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    });

    // --- Sharing Functionality ---
    const shareDetails = {
        title: 'الأيقونة للعطور - جودة وأصالة',
        text: `الأيقونة للعطور - جودة وأصالة\nعطور رجالية ونسائية وأجود أنواع البخور.\nيوجد لدينا التوصيل إلى جميع المحافظات اليمنية.\n\n↓روابط الأيقونة للعطور↓\nموقع الويب↓\nhttps://talalye1.github.io/Icon-perfumes\nفيسبوك↓\nhttps://facebook.com/@alayqwnt.ll.twr\nانستجرام↓\nhttps://www.instagram.com/lyqwn_lltwr\nللطلب والاستفسارات راسلنا على الماسنجر↓\nhttps://m.me/alayqwnt.ll.twr`,
        url: 'https://talalye1.github.io/Icon-perfumes/'
    };

    function getProductShareText(productName) {
        return `شاهد هذا المنتج الرائع من الأيقونة للعطور: ${productName}\n${shareDetails.url}`;
    }

    window.shareProduct = async (platform, productName) => {
        const text = getProductShareText(productName);
        const url = shareDetails.url + '#product-' + productName.replace(/\s+/g, '-');
        share(platform, text, url);
    };

    window.sharePage = async (platform) => {
        share(platform, shareDetails.text, shareDetails.url);
    };

    function share(platform, text, url) {
        const encodedUrl = encodeURIComponent(url);
        const encodedText = encodeURIComponent(text);
        let shareUrl;

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
                break;
            case 'instagram':
                 alert("لا يمكن المشاركة مباشرة على انستجرام من الويب. يرجى نسخ الرابط ومشاركته يدوياً.");
                 return;
            case 'all':
                if (navigator.share) {
                    navigator.share({ title: shareDetails.title, text: text, url: url })
                        .catch(console.error);
                } else {
                    alert("متصفحك لا يدعم المشاركة المباشرة. يمكنك نسخ الرابط.");
                }
                return;
        }
        window.open(shareUrl, '_blank');
    }

    // --- Comment System (Firestore) ---
    const commentsRef = db.collection("comments");

    function formatTimeAgo(timestamp) {
        if (!timestamp) return "";
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

    function loadInitialComments() {
        commentsRef.orderBy("timestamp", "desc").limit(commentsPerPage).get()
            .then(querySnapshot => {
                commentsList.innerHTML = ''; 
                if (querySnapshot.empty) {
                    commentsList.innerHTML = '<p style="text-align:center;">لا توجد تعليقات حتى الآن. كن أول من يعلق!</p>';
                    return;
                }
                querySnapshot.forEach(doc => {
                    const commentEl = createCommentElement({ id: doc.id, ...doc.data() });
                    commentsList.appendChild(commentEl);
                });
                lastVisibleComment = querySnapshot.docs[querySnapshot.docs.length - 1];
                document.getElementById('load-more-comments').style.display = 'block';
            })
            .catch(error => console.error("Error loading comments: ", error));
    }
    
    commentsRef.orderBy("timestamp", "desc").onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            if (change.type === "added" && !document.querySelector(`.comment[data-id="${change.doc.id}"]`)) {
                const newCommentEl = createCommentElement({ id: change.doc.id, ...change.doc.data() });
                commentsList.prepend(newCommentEl);
            }
        });
    });

    submitCommentBtn.addEventListener('click', () => {
        const name = commentNameInput.value.trim();
        const content = commentTextInput.value.trim();
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
            commentNameInput.value = '';
            commentTextInput.value = '';
            alert("تم نشر تعليقك بنجاح!");
        }).catch(error => {
            console.error("Error adding comment: ", error);
            alert("حدث خطأ أثناء نشر التعليق.");
        });
    });

    loadInitialComments(); 

    // --- AI Chat (Gemini) ---
    const chatIconContainer = document.getElementById('chat-icon-container');
    const chatIcon = document.getElementById('chat-icon');
    const chatWindow = document.getElementById('chat-window');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const namePromptModal = document.getElementById('name-prompt-modal');
    const submitChatNameBtn = document.getElementById('submit-chat-name');
    const chatUserNameInput = document.getElementById('chat-user-name');
    const music = document.getElementById('background-music');
    let chatUserName = localStorage.getItem('chatUserName');
    const predefinedResponses = {
        "دفع": "نحن نقدم عدة طرق للدفع: التحويل البنكي، الدفع عن طريق إيداع إلى حسابنا في بنك الكريمي. في حالة عدم وجود فرع لبنك الكريمي نقبل الحوالات المصرفية عبر محلات الصرافة المنتشرة في جميع المناطق أو الدفع عبر المحافظ الإلكترونية.",
        "توصيل": "مدة التوصيل تتراوح بين 1-3 أيام في المدن الكبرى، و3-7 أيام لباقي المناطق.",
        "جودة": "جميع منتجاتنا أصلية وذات جودة عالية مع ضمان استرجاع في حال عدم الرضا.",
        "عروض": "لدينا عروض دورية. تابعونا على صفحات التواصل الاجتماعي لمعرفة أحدث العروض.",
        "سعر": "الأسعار تختلف حسب نوع المنتج. يمكنك الاطلاع على الأسعار في صفحة المنتج أو التواصل مع خدمة العملاء.",
        "أصلية": "نضمن لكم أن جميع منتجاتنا أصلية 100% مع شهادات ضمان الجودة.",
        "استبدال": "نقدم خدمة استبدال المنتج خلال 7 أيام من الاستلام في حال وجود عيب مصنعي.",
        "رجوع": "يمكنك إرجاع المنتج خلال 7 أيام من الاستلام مع الحفاظ على العبوة الأصلية.",
        "بخور": "لدينا تشكيلة واسعة من البخور والعود بجودة عالية وأسعار تنافسية.",
        "رجالي": "لدينا تشكيلة واسعة من العطور الرجالية بجودة عالية وأسعار تنافسية.",
        "نسائي": "لدينا تشكيلة واسعة من العطور النسائية بجودة عالية وأسعار تنافسية.",
        "عنوان": "الأيقونة للعطور مقرها في محافظة ذمار.",
        "مصمم": "المصمم طلال سليمان قايد المقطري.",
        "مبرمج": "المبرمج طلال سليمان قايد المقطري.",
        "تواصل": "يمكنك التواصل معنا عبر الماسنجر: https://m.me/alayqwnt.ll.twr",
    };
    
    setTimeout(() => {
        chatIconContainer.classList.add('show-popup');
        const welcomeSound = new Audio('https://www.soundjay.com/button/sounds/beep-07.mp3'); 
        welcomeSound.play().catch(e => console.log("Audio play blocked by browser."));
        setTimeout(() => chatIconContainer.classList.remove('show-popup'), 5000);
    }, 2000);

    chatIcon.addEventListener('click', () => {
        if (!chatUserName) {
            namePromptModal.style.display = 'block';
        } else {
            chatWindow.classList.toggle('open');
        }
    });

    submitChatNameBtn.addEventListener('click', () => {
        const name = chatUserNameInput.value.trim();
        if (name) {
            chatUserName = name;
            localStorage.setItem('chatUserName', name);
            namePromptModal.style.display = 'none';
            chatWindow.classList.add('open');
        } else {
            alert("الرجاء إدخال اسمك.");
        }
    });

    chatSendBtn.addEventListener('click', handleChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleChatMessage();
        }
    });

    function handleChatMessage() {
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        addMessageToChat('user', chatUserName, userMessage);
        chatInput.value = '';

        if (userMessage.toLowerCase().includes('تشغيل')) {
            music.play().catch(e => addMessageToChat('bot', 'النظام', 'لم أتمكن من تشغيل الموسيقى.'));
            addMessageToChat('bot', 'النظام', 'تم تشغيل الموسيقى.');
            return;
        }
        if (userMessage.toLowerCase().includes('إيقاف')) {
            music.pause();
            addMessageToChat('bot', 'النظام', 'تم إيقاف الموسيقى.');
            return;
        }

        const keyword = Object.keys(predefinedResponses).find(k => userMessage.includes(k));
        if (keyword) {
            const response = predefinedResponses[keyword];
            addMessageToChat('bot', 'خدمة العملاء', response, true);
        } else {
            getGeminiChatResponse(userMessage);
        }
    }
    
    function addMessageToChat(sender, name, text, speak = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        let senderNameHTML = `<div class="message-sender">${name}</div>`;
        if (sender === 'bot') {
            senderNameHTML = `<div class="message-sender"><img src="icon.png" style="width:20px; height:20px; border-radius:50%; margin-left:5px;">${name}</div>`;
        }
        
        messageDiv.innerHTML = `${senderNameHTML}<div class="message-bubble">${text}</div>`;
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;

        if (speak) {
            speakText(text);
        }
    }

    function speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ar-SA';
            window.speechSynthesis.speak(utterance);
        }
    }

    async function callGeminiAPI(prompt, button) {
        if (button) button.disabled = true;
        const apiKey = ""; // API Key is handled by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

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

    async function getGeminiChatResponse(userPrompt) {
        addMessageToChat('bot', 'خدمة العملاء', ' أفكر...');
        const fullPrompt = `أنت مساعد ذكي في متجر عطور اسمه "الأيقونة للعطور". أجب على السؤال التالي باللهجة العربية وبشكل مختصر ومفيد. السؤال هو: ${userPrompt}`;
        const geminiText = await callGeminiAPI(fullPrompt);
        chatBody.removeChild(chatBody.lastChild); // Remove "thinking..."
        addMessageToChat('bot', 'خدمة العملاء', geminiText, true);
    }
    
    // --- ✨ NEW GEMINI FEATURE: Generate Product Description ---
    window.generateProductDescription = async (productName, elementId) => {
        const button = event.target;
        const descElement = document.getElementById(elementId);
        descElement.innerText = 'جاري كتابة وصف إبداعي...';
        
        const prompt = `أنت كاتب إعلانات متخصص في العطور. اكتب وصفاً تسويقياً جذاباً ومختصراً (حوالي 30-40 كلمة) لمنتج عطور اسمه "${productName}". استخدم لغة شعرية ومثيرة للمشاعر لإغراء الزبائن.`;
        const newDescription = await callGeminiAPI(prompt, button);
        descElement.innerText = newDescription;
    };
    
    // --- ✨ NEW GEMINI FEATURE: Analyze Comments ---
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
            
            التعليقات:
            ---
            ${commentsText}
            ---
            `;
            
            const analysis = await callGeminiAPI(prompt, button);
            resultDiv.innerHTML = analysis;
            
        } catch(error) {
            console.error("Error analyzing comments:", error);
            resultDiv.innerHTML = '<h3>حدث خطأ أثناء تحليل التعليقات.</h3>';
        }
    });

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => console.log('ServiceWorker registration successful with scope: ', registration.scope))
                .catch(err => console.log('ServiceWorker registration failed: ', err));
        });
    }

}); // End of DOMContentLoaded
