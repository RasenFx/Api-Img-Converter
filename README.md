# API Image Converter

## Descripción
API para convertir imágenes de diferentes formatos a WebP, asignando un nombre de archivo personalizado y nivel de calidad.

## Tecnologías
- Node.js
- Express
- Sharp

## Dependencias
- Sharp (para manipulación de imágenes)
- Express (para crear la API)
- Multer (para manejo de archivos)
- CORS (para seguridad de origen cruzado)
- Helmet (para cabeceras de seguridad)
- Express-rate-limit (para limitar peticiones)
- Express-validator (para validación de entradas)
- Morgan (para registro de peticiones)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/yourusername/api-image-converter.git
cd api-image-converter
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env según sea necesario
```

4. Iniciar el servidor:
```bash
npm start
```

Para desarrollo:
```bash
npm run dev
```

## Uso de la API

### Endpoint de Conversión

**URL**: `/api/convert`
**Método**: `POST`
**Content-Type**: `multipart/form-data`

**Parámetros**:
- `image` (archivo): La imagen a convertir (formatos soportados: JPEG, PNG, GIF, TIFF, etc.)
- `filename` (string): Nombre deseado para el archivo convertido (sin extensión)
- `quality` (número): Valor de calidad para la compresión WebP (1-100)

**Ejemplo de uso con cURL**:
```bash
curl -X POST \
  http://localhost:3000/api/convert \
  -H 'Content-Type: multipart/form-data' \
  -F 'image=@/ruta/a/tu/imagen.jpg' \
  -F 'filename=imagen_convertida' \
  -F 'quality=80'
```

**Ejemplo de uso con JavaScript**:
```javascript
const form = new FormData();
form.append('image', fileInput.files[0]);
form.append('filename', 'imagen_convertida');
form.append('quality', '80');

fetch('http://localhost:3000/api/convert', {
  method: 'POST',
  body: form
})
.then(response => response.blob())
.then(blob => {
  // Manejar el archivo WebP recibido
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'imagen_convertida.webp';
  a.click();
})
.catch(error => console.error('Error:', error));
```

## Funcionamiento
1. El usuario envía una solicitud POST a la API con un archivo de imagen, el nombre de archivo y el valor de calidad.
   - El archivo debe ser enviado como un archivo adjunto (multipart/form-data).
   - El nombre del archivo debe ser una cadena de texto.
   - La calidad debe ser un número entre 1 y 100.
2. La API valida el archivo y lo convierte al formato WebP.
3. La API devuelve el archivo convertido con el nombre especificado.
4. Si el archivo no es una imagen válida, se devuelve un error.
5. Si el archivo excede el tamaño máximo (10MB), se devuelve un error.

## Seguridad Implementada
- ✅ Validación de archivos para asegurarse de que son imágenes.
- ✅ Límites de tamaño de archivo (10MB máximo).
- ✅ Validación de la calidad para asegurarse de que está dentro del rango permitido.
- ✅ Manejo de errores para evitar la exposición de información sensible.
- ✅ Registro de peticiones con Morgan.
- ✅ Límites de tasa para prevenir abusos (100 peticiones por 15 minutos).
- ✅ CORS configurado para permitir solo orígenes confiables.
- ✅ Configuración de cabeceras de seguridad con Helmet.
- ✅ Validación de entradas para prevenir inyecciones.
- ✅ Limpieza de archivos temporales después de su uso.

## Configuración
La API puede configurarse mediante variables de entorno:

- `PORT`: Puerto en el que se ejecutará el servidor (por defecto: 3000)
- `ALLOWED_ORIGINS`: Orígenes permitidos para CORS, separados por comas

## Licencia
ISC
