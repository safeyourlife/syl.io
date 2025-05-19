document.addEventListener("DOMContentLoaded", () => {
    const mapButton = document.getElementById("map");
    const buttonsContainer = document.getElementById("buttons-container");
    const mapContainer = document.getElementById("map-container");
    const homeFooterButton = document.getElementById("footer-home");

    // Exibe o mapa e oculta os botões ao clicar no botão Mapa
    mapButton.addEventListener("click", () => {
        buttonsContainer.classList.add("hidden");
        mapContainer.classList.remove("hidden");
        initializeMap();
    });

    // Faz os botões reaparecerem ao clicar no ícone de Início no rodapé
    homeFooterButton.addEventListener("click", () => {
        buttonsContainer.classList.remove("hidden");
        mapContainer.classList.add("hidden");
    });

    // Inicializa o mapa com a localização exata do usuário
    function initializeMap() {
        const map = L.map('map-container').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 25,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Obter localização exata do usuário
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;

                    // Criar ícone personalizado com efeito pulsante azul
                    const userIcon = L.divIcon({
                        className: 'custom-marker blue pulse',
                        iconSize: [10, 10],
                        iconAnchor: [10, 10],
                        popupAnchor: [0, -10]
                    });

                    // Criar marcador
                    const userMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map);
                    userMarker.bindPopup("Você está aqui!");

                    // Ajustar a visualização do mapa para focar no usuário
                    map.setView([lat, lon], 16);
                },
                () => {
                    alert("Não foi possível obter a localização.");
                }
            );
        } else {
            alert("Geolocalização não é suportada pelo navegador.");
        }
    }
});
