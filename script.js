    <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js" type="module"></script>
    <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js" type="module"></script>
    
    <script type="module">
      // Import the functions you need from the SDKs you need
      import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
      import { getFirestore, collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, doc, getDoc, setDoc, runTransaction } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
    
      // Your web app's Firebase configuration
      const firebaseConfig = {
        apiKey: "AIzaSyAcOLUzUULR6HYcJKdPCFvhJJHT4gKnczU",
        authDomain: "icon-for-perfumes-5ccd6.firebaseapp.com",
        projectId: "icon-for-perfumes-5ccd6",
        storageBucket: "icon-for-perfumes-5ccd6.appspot.com",
        messagingSenderId: "942406140856",
        appId: "1:942406140856:web:ff4729e3f3a7653a56454d"
      };
    
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      
      // Gemini API Key
      const GEMINI_API_KEY = "AIzaSyDSGuS0cRduU1dPGzHjXRjWvjDgzL4NyIY";
      
      // --- Facebook SDK Init ---
      // This function is called after the FB SDK is loaded
      window.fbAsyncInit = function() {
        FB.init({
          appId      : 'YOUR_APP_ID', // Replace with a real App ID for full functionality
          cookie     : true,
          xfbml      : true,
          version    : 'v23.0'
        });
        FB.AppEvents.logPageView();
      };

      // --- PWA Installation ---
      let deferredPrompt;
      const pwaInstallPrompt = document.getElementById('pwaInstallPrompt');
      const installPwaBtn = document.getElementById('installPwaBtn');
      const dismissPwaBtn = document.getElementById('dismissPwaBtn');

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        setTimeout(() => {
            pwaInstallPrompt.style.display = 'flex';
        }, 5000); // Show after 5 seconds
        
        setTimeout(() => {
            if(pwaInstallPrompt.style.display === 'flex') {
                pwaInstallPrompt.style.display = 'none';
            }
        }, 25000); // Hide after 20 more seconds
      });

      installPwaBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            pwaInstallPrompt.style.display = 'none';
        }
      });
      
      dismissPwaBtn.addEventListener('click', () => {
          pwaInstallPrompt.style.display = 'none';
      });


      // --- APK Install ---
      const installApkBtn = document.getElementById('installApkBtn');
      const progressContainer = document.getElementById('downloadProgressContainer');
      const progressBar = document.getElementById('downloadProgress');
      const progressStatus = document.getElementById('downloadStatus');
      
      installApkBtn.addEventListener('click', async () => {
          installApkBtn.disabled = true;
          progressContainer.style.display = 'block';

          try {
            const response = await fetch('./app.apk');
            if (!response.ok) {
                throw new Error(`خطأ في الشبكة: ${response.statusText}`);
            }

            const contentLength = +response.headers.get('Content-Length');
            const totalMB = (contentLength / 1024 / 1024).toFixed(2);
            let loaded = 0;

            const reader = response.body.getReader();
            const chunks = [];

            while(true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                loaded += value.length;
                const loadedMB = (loaded / 1024 / 1024).toFixed(2);
                
                const percent = Math.round((loaded / contentLength) * 100);
                progressBar.value = percent;
                progressStatus.textContent = `${percent}% (${loadedMB} MB / ${totalMB} MB)`;
            }

            const blob = new Blob(chunks, { type: 'application/vnd.android.package-archive' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'icon-perfumes.apk';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            
            progressStatus.textContent = "اكتمل التحميل!";
          } catch(error) {
            progressStatus.textContent = `فشل التحميل: ${error.message}`;
            console.error('Download error:', error);
          } finally {
            installApkBtn.disabled = false;
          }
      });


      // --- Image Modal ---
      window.expandImage = (imageSrc) => {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        modal.style.display = "flex";
        modalImg.src = imageSrc;
      };
      
      window.closeModal = () => {
        document.getElementById('imageModal').style.display = "none";
      };

      window.changeImage = (imageSrc, mainImageElement, thumbnailElement) => {
          mainImageElement.src = imageSrc;
          const thumbnails = thumbnailElement.parentElement.querySelectorAll('.thumbnail');
          thumbnails.forEach(thumb => thumb.classList.remove('active'));
          thumbnailElement.classList.add('active');
      };

      // --- Comments Section (Firestore) ---
      const commentForm = document.getElementById('commentForm');
      const commentsContainer = document.getElementById('commentsContainer');
      const commentName = document.getElementById('commentName');
      const commentContent = document.getElementById('commentContent');

      function formatTimeAgo(date) {
        if (!date) return "";
        const seconds = Math.floor((new Date() - date) / 1000);
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
        return "الآن";
      }

      function renderComments(doc) {
          const comment = doc.data();
          const commentDiv = document.createElement('div');
          commentDiv.className = 'comment';
          commentDiv.setAttribute('data-id', doc.id);

          const date = comment.createdAt ? comment.createdAt.toDate() : new Date();
          
          commentDiv.innerHTML = `
              <div class="comment-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <div class="comment-author">${comment.name}</div>
                  <div class="comment-date" data-timestamp="${date.getTime()}">${formatTimeAgo(date)}</div>
              </div>
              <p class="comment-content">${comment.content}</p>
          `;
          commentsContainer.prepend(commentDiv);
      }
      
      // Load comments from Firestore
      const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
      onSnapshot(q, (snapshot) => {
          commentsContainer.innerHTML = '';
          snapshot.docs.forEach(doc => {
              renderComments(doc);
          });
      });

      // Update timestamps every minute
      setInterval(() => {
          document.querySelectorAll('.comment-date').forEach(el => {
              const timestamp = parseInt(el.getAttribute('data-timestamp'));
              if (timestamp) {
                  el.textContent = formatTimeAgo(new Date(timestamp));
              }
          });
      }, 60000);

      // Add new comment
      commentForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = commentName.value.trim();
          const content = commentContent.value.trim();

          if (name && content) {
              await addDoc(collection(db, "comments"), {
                  name: name,
                  content: content,
                  createdAt: serverTimestamp()
              });
              commentForm.reset();
          }
      });
      
      // --- Chatbot, Welcome Message, etc. ---
      const chatIcon = document.getElementById('chatIcon');
      const chatWindow = document.getElementById('chatWindow');
      const closeChat = document.getElementById('closeChat');
      const chatBody = document.getElementById('chatBody');
      const chatFooter = document.getElementById('chatFooter');
      let chatUserName = localStorage.getItem('chatUserName');

      const welcomeMessage = document.getElementById('welcomeMessage');
      const closeWelcomeBtn = document.getElementById('closeWelcome');
      let welcomeTimeout;

      function showWelcomeMessage() {
          welcomeMessage.classList.add('show');
          welcomeTimeout = setTimeout(() => {
              welcomeMessage.classList.remove('show');
          }, 8000); // Hide after 8 seconds
      }
      
      closeWelcomeBtn.addEventListener('click', () => {
          clearTimeout(welcomeTimeout);
          welcomeMessage.classList.remove('show');
      });

      setTimeout(showWelcomeMessage, 5000); // First appearance after 5s
      setInterval(() => {
        if (!chatWindow.classList.contains('active')) {
            showWelcomeMessage();
        }
      }, 30000); // Re-appear every 30s if chat is closed


      function setupChatUI() {
          chatFooter.innerHTML = '';
          if (!chatUserName) {
              chatFooter.innerHTML = `
                <div id="namePrompt">
                    <input type="text" class="chat-input" id="userNameInput" placeholder="أدخل اسمك الكريم للبدء...">
                    <button class="send-btn" id="setUserNameBtn"><i class="fas fa-check"></i></button>
                </div>
              `;
              document.getElementById('setUserNameBtn').addEventListener('click', handleNameSubmit);
              document.getElementById('userNameInput').addEventListener('keypress', (e) => {
                  if (e.key === 'Enter') handleNameSubmit();
              });
          } else {
              chatFooter.innerHTML = `
                <div id="chatInputContainer">
                  <input type="text" class="chat-input" id="chatInput" placeholder="اكتب رسالتك هنا...">
                  <button class="send-btn" id="sendBtn"><i class="fas fa-paper-plane"></i></button>
                </div>
              `;
              document.getElementById('sendBtn').addEventListener('click', handleMessageSend);
              document.getElementById('chatInput').addEventListener('keypress', (e) => {
                  if (e.key === 'Enter') handleMessageSend();
              });
          }
      }

      function handleNameSubmit() {
          const input = document.getElementById('userNameInput');
          const name = input.value.trim();
          if (name) {
              chatUserName = name;
              localStorage.setItem('chatUserName', name);
              addMessageToChat(`أهلاً بك يا ${name}! كيف يمكنني مساعدتك اليوم؟`, 'bot');
              setupChatUI();
          }
      }

      async function handleMessageSend() {
          const input = document.getElementById('chatInput');
          const message = input.value.trim();
          if (message) {
              addMessageToChat(message, 'user');
              input.value = '';
              await processMessage(message);
          }
      }
      
      function addMessageToChat(text, sender, isTyping = false) {
          const messageDiv = document.createElement('div');
          messageDiv.className = `chat-message ${sender}-message`;
          if (isTyping) {
              messageDiv.id = 'typing-indicator';
              messageDiv.innerHTML = '<i>يفكر...</i>';
          } else {
              messageDiv.textContent = text;
              // Log to Firestore
              addDoc(collection(db, "chat_log"), {
                  user: sender === 'user' ? chatUserName : 'bot',
                  message: text,
                  timestamp: serverTimestamp()
              });
          }
          chatBody.appendChild(messageDiv);
          chatBody.scrollTop = chatBody.scrollHeight;
      }
      
      chatIcon.addEventListener('click', () => {
          welcomeMessage.classList.remove('show');
          clearTimeout(welcomeTimeout);
          chatWindow.classList.toggle('active');
          if (chatWindow.classList.contains('active') && chatBody.children.length === 0) {
              setupChatUI();
              if(!chatUserName) {
                addMessageToChat('مرحباً بك في خدمة عملاء الأيقونة للعطور.', 'bot');
              } else {
                addMessageToChat(`أهلاً بعودتك يا ${chatUserName}!`, 'bot');
              }
          }
      });
      closeChat.addEventListener('click', () => chatWindow.classList.remove('active'));

      // Text-to-Speech
      let egyptianVoice = null;
      function loadVoices() {
          const voices = window.speechSynthesis.getVoices();
          egyptianVoice = voices.find(voice => voice.lang === 'ar-EG');
          if (!egyptianVoice) {
             egyptianVoice = voices.find(voice => voice.lang.startsWith('ar-'));
          }
      }
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();

      function speak(text) {
          if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel(); // Cancel any previous speech
              const utterance = new SpeechSynthesisUtterance(text);
              if (egyptianVoice) {
                  utterance.voice = egyptianVoice;
              }
              utterance.lang = 'ar-EG';
              window.speechSynthesis.speak(utterance);
          }
      }
      
      // Message Processing and Gemini
      async function processMessage(message) {
          const musicPlayCommands = ['تشغيل', 'شغل', 'غني', 'شغل اغاني', 'غنيلي'];
          const musicStopCommands = ['ايقاف', 'إيقاف', 'إغلاق', 'اغلاق', 'طفي'];

          if (musicPlayCommands.some(cmd => message.includes(cmd))) {
              document.getElementById('backgroundMusic').play();
              const reply = 'تم تشغيل الموسيقى. لإيقافها، اكتب "إيقاف".';
              addMessageToChat(reply, 'bot');
              speak(reply);
              return;
          }
          if (musicStopCommands.some(cmd => message.includes(cmd))) {
              document.getElementById('backgroundMusic').pause();
              const reply = 'تم إيقاف الموسيقى.';
              addMessageToChat(reply, 'bot');
              speak(reply);
              return;
          }
          
          // Fallback to Gemini
          addMessageToChat('', 'bot', true); // Show typing indicator
          try {
              const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      "contents": [{
                          "parts": [{ "text": `أنت مساعد ذكي في متجر عطور اسمه "الأيقونة". أجب على السؤال التالي باللغة العربية بأسلوب ودود ومختصر: ${message}` }]
                      }]
                  })
              });
              
              document.getElementById('typing-indicator')?.remove();
              
              if (!response.ok) {
                  throw new Error('فشل الاتصال بالذكاء الاصطناعي.');
              }
              const data = await response.json();
              const botReply = data.candidates[0].content.parts[0].text;
              addMessageToChat(botReply, 'bot');
              speak(botReply);

          } catch (error) {
              document.getElementById('typing-indicator')?.remove();
              console.error('Gemini Error:', error);
              addMessageToChat('عذراً، حدث خطأ أثناء محاولة الرد. يرجى المحاولة مرة أخرى.', 'bot');
          }
      }
      
      // --- Order & Share Functions ---
      
      window.orderProduct = (productName) => {
          if (typeof FB === 'undefined') {
              alert('لم يتم تحميل عدة تطوير فيسبوك بعد. يرجى المحاولة مرة أخرى.');
              return;
          }
          FB.getLoginStatus(function(response) {
            const baseMessage = `العميل: الاخوه مبيعات الأيقونة للعطور، السلام عليكم. أريد معلومات عن هذا المنتج: ${productName}. هل يمكن تزويدي بالأسعار؟ رابط المنتج: ${window.location.href}`;
            let finalMessage = '';
            
            if (response.status === 'connected') {
                FB.api('/me', { fields: 'name' }, function(meResponse) {
                    const userName = meResponse.name;
                    finalMessage = `اهلا بك يا ${userName}. ${baseMessage}`;
                    const encodedMessage = encodeURIComponent(finalMessage);
                    window.open(`https://m.me/alayqwnt.ll.twr?text=${encodedMessage}`, '_blank');
                });
            } else {
                // User not logged in or not authorized
                finalMessage = `اهلا بك. ${baseMessage}. يرجى تزويدنا باسمك ورقم هاتفك ومكان إقامتك لنسهل عملية الطلب.`;
                const encodedMessage = encodeURIComponent(finalMessage);
                window.open(`https://m.me/alayqwnt.ll.twr?text=${encodedMessage}`, '_blank');
            }
          });
      };
      
      const shareTextTemplate = (productName) => `الأيقونة للعطور - جودة وأصالة
${productName}
عطور رجاليه ونسائيه واجود انواع البخور
يوجد لدينا التوصيل الى جميع المحافظات اليمنيه
↓روابط الأيقونة للعطور↓
موقع متجر الايقونة↓
https://talalye1.github.io/Icon-perfumes
تطبيق متجر الايقونة ↓
https://talalye1.github.io/Icon-perfumes/الأيقونة.apk
حساب متجر الأيقونة فيسبوك↓ 
https://facebook.com/alayqwnt.ll.twr
حساب متجر الأيقونة انستجرام↓
https://www.instagram.com/lyqwn_lltwr
للطلب والإستفسارات راسلنا على الماسنجر↓
https://m.me/alayqwnt.ll.twr`;

      window.shareContent = (text, platform) => {
          const encodedText = encodeURIComponent(text);
          const pageUrl = encodeURIComponent('https://talalye1.github.io/Icon-perfumes');
          let url = '';

          switch (platform) {
              case 'facebook':
                  url = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}&quote=${encodedText}`;
                  break;
              case 'twitter':
                  url = `https://twitter.com/intent/tweet?text=${encodedText}`;
                  break;
              case 'whatsapp':
                  url = `https://wa.me/?text=${encodedText}`;
                  break;
              case 'instagram':
                  alert('للمشاركة على انستجرام، يرجى نسخ النص وفتحه في التطبيق.');
                  navigator.clipboard.writeText(text);
                  window.open('https://www.instagram.com/lyqwn_lltwr', '_blank');
                  return;
              case 'all':
                  if (navigator.share) {
                      navigator.share({
                          title: 'الأيقونة للعطور - جودة وأصالة',
                          text: text,
                          url: 'https://talalye1.github.io/Icon-perfumes'
                      }).catch(console.error);
                  } else {
                      alert('المتصفح لا يدعم المشاركة المباشرة. يمكنك نسخ النص.');
                      navigator.clipboard.writeText(text);
                  }
                  return;
          }
          window.open(url, '_blank');
      };

      window.shareProduct = (productName, platform) => {
          const text = shareTextTemplate(productName);
          shareContent(text, platform);
      };

      window.sharePage = (platform) => {
          const text = shareTextTemplate("تصفحوا مجموعتنا المميزة!");
          shareContent(text, platform);
      };
      
      // --- Product Ratings (Firestore) ---
      async function setRating(productId, ratingValue) {
          const ratingRef = doc(db, 'product-ratings', productId);
          try {
              await runTransaction(db, async (transaction) => {
                  const ratingDoc = await transaction.get(ratingRef);
                  if (!ratingDoc.exists()) {
                      transaction.set(ratingRef, { total_rating: ratingValue, rating_count: 1 });
                  } else {
                      const newCount = ratingDoc.data().rating_count + 1;
                      const newTotal = ratingDoc.data().total_rating + ratingValue;
                      transaction.update(ratingRef, {
                          total_rating: newTotal,
                          rating_count: newCount
                      });
                  }
              });
              alert('شكراً لتقييمك!');
          } catch (e) {
              console.error("Transaction failed: ", e);
              alert('فشل حفظ التقييم.');
          }
      }

      function updateRatingDisplay(productId, data) {
          const ratingContainer = document.getElementById(`rating-${productId}`);
          const ratingCountEl = document.getElementById(`rating-count-${productId}`);
          if (!ratingContainer || !data || data.rating_count === 0) {
            ratingCountEl.textContent = '(0 تقييم)';
            return;
          };
          
          const avgRating = data.total_rating / data.rating_count;
          const avgRounded = Math.round(avgRating * 2) / 2; // round to nearest 0.5

          ratingCountEl.textContent = `(${data.rating_count} تقييم)`;
          ratingContainer.querySelectorAll('i').forEach((star, index) => {
              if (avgRounded >= index + 1) {
                  star.className = 'fas fa-star';
              } else if (avgRounded >= index + 0.5) {
                  star.className = 'fas fa-star-half-alt';
              } else {
                  star.className = 'far fa-star';
              }
          });
      }
      
      document.querySelectorAll('.product').forEach(product => {
          const productId = product.dataset.productId;
          if (productId) {
              // Load initial rating
              const ratingDocRef = doc(db, 'product-ratings', productId);
              onSnapshot(ratingDocRef, (doc) => {
                  updateRatingDisplay(productId, doc.data());
              });

              // Add click listeners
              const ratingContainer = document.getElementById(`rating-${productId}`);
              ratingContainer.querySelectorAll('i').forEach(star => {
                  star.addEventListener('click', () => {
                      const ratingValue = parseInt(star.dataset.value);
                      setRating(productId, ratingValue);
                  });
              });
          }
      });
      
      // --- Social Media Modal ---
      window.openSocialModal = (platform) => {
        const modal = document.getElementById('socialModal');
        const body = document.getElementById('socialModalBody');
        body.innerHTML = ''; // Clear previous content

        if(platform === 'facebook') {
            body.innerHTML = `<div class="fb-page" data-href="https://facebook.com/alayqwnt.ll.twr" data-tabs="timeline" data-width="500" data-height="600" data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="true"><blockquote cite="https://facebook.com/alayqwnt.ll.twr" class="fb-xfbml-parse-ignore"><a href="https://facebook.com/alayqwnt.ll.twr">الأيقونة للعطور</a></blockquote></div>`;
            if (FB) FB.XFBML.parse(body); // Re-parse for dynamic content
        } else if (platform === 'instagram') {
             body.innerHTML = `<iframe src="https://www.instagram.com/lyqwn_lltwr/embed" width="100%" height="100%" frameborder="0"></iframe>`;
        }
        modal.style.display = 'flex';
      }

      window.closeSocialModal = () => {
        document.getElementById('socialModal').style.display = 'none';
        document.getElementById('socialModalBody').innerHTML = '';
      }

    </script>
