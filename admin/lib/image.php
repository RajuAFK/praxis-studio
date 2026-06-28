<?php
declare(strict_types=1);

/**
 * Validate + resize an uploaded image and save it as JPEG q85 to $dir/$name.jpg.
 * Returns the saved basename (e.g. "hero.jpg") or null on failure.
 *
 * - MIME whitelist: jpeg, png, webp
 * - Max input size: 25 MB
 * - Max output width: 2000 px (preserves aspect)
 */
function image_save_upload(array $file, string $dir, string $name): ?string {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) return null;
    if (($file['size'] ?? 0) > 25 * 1024 * 1024) return null;
    $tmp = (string)($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) return null;

    $info = @getimagesize($tmp);
    if ($info === false) return null;
    [$w, $h, $type] = $info;

    $src = null;
    switch ($type) {
        case IMAGETYPE_JPEG:
            $src = @imagecreatefromjpeg($tmp); break;
        case IMAGETYPE_PNG:
            $src = @imagecreatefrompng($tmp); break;
        case IMAGETYPE_WEBP:
            if (function_exists('imagecreatefromwebp')) $src = @imagecreatefromwebp($tmp);
            break;
        default:
            return null;
    }
    if (!$src) return null;

    $maxW = 2000;
    if ($w > $maxW) {
        $newW = $maxW;
        $newH = (int)round($h * ($maxW / $w));
        $resized = imagecreatetruecolor($newW, $newH);
        // Preserve PNG alpha when downsampling (we still save as JPEG so flatten on white)
        imagefill($resized, 0, 0, imagecolorallocate($resized, 255, 255, 255));
        imagecopyresampled($resized, $src, 0, 0, 0, 0, $newW, $newH, $w, $h);
        imagedestroy($src);
        $src = $resized;
    } elseif ($type === IMAGETYPE_PNG) {
        // Flatten alpha against white so the JPEG looks right
        $flat = imagecreatetruecolor($w, $h);
        imagefill($flat, 0, 0, imagecolorallocate($flat, 255, 255, 255));
        imagecopy($flat, $src, 0, 0, 0, 0, $w, $h);
        imagedestroy($src);
        $src = $flat;
    }

    if (!is_dir($dir)) @mkdir($dir, 0755, true);
    $out = rtrim($dir, '/') . '/' . $name . '.jpg';
    $ok = imagejpeg($src, $out, 85);
    imagedestroy($src);
    return $ok ? "$name.jpg" : null;
}
