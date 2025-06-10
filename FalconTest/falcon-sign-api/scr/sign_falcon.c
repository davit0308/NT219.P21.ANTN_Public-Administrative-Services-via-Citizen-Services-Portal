#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "oqs/oqs.h"

int main() {
    OQS_SIG* sig = OQS_SIG_new("falcon-512");

    if (sig == NULL) {
        printf("Không thể khởi tạo Falcon-512\n");
        return EXIT_FAILURE;
    }

    printf("Falcon-512 đã sẵn sàng.\n");
    printf("Độ dài public key: %zu bytes\n", sig->length_public_key);
    printf("Độ dài private key: %zu bytes\n", sig->length_secret_key);
    printf("Độ dài chữ ký: %zu bytes\n", sig->length_signature);

    // Cấp phát động
    uint8_t* public_key = (uint8_t*)malloc(sig->length_public_key);
    uint8_t* secret_key = (uint8_t*)malloc(sig->length_secret_key);
    uint8_t* signature = (uint8_t*)malloc(sig->length_signature);

    if (public_key == NULL || secret_key == NULL || signature == NULL) {
        printf("Lỗi cấp phát bộ nhớ\n");
        OQS_SIG_free(sig);
        return EXIT_FAILURE;
    }

    // Tạo key pair
    if (OQS_SIG_keypair(sig, public_key, secret_key) != OQS_SUCCESS) {
        printf("Không thể tạo key pair\n");
        OQS_SIG_free(sig);
        return EXIT_FAILURE;
    }

    printf("Đã tạo key pair.\n");

    // Dữ liệu cần ký
    const char* message = "Xin chào từ Falcon-512!";
    size_t message_len = strlen(message);

    // Ký dữ liệu
    size_t signature_len;
    if (OQS_SIG_sign(sig, signature, &signature_len, (const uint8_t*)message, message_len, secret_key) != OQS_SUCCESS) {
        printf("Ký thất bại\n");
        OQS_SIG_free(sig);
        return EXIT_FAILURE;
    }

    printf("Đã ký dữ liệu. Độ dài chữ ký thực tế: %zu bytes\n", signature_len);

    // Xác thực chữ ký
    OQS_STATUS verify_status = OQS_SIG_verify(sig, (const uint8_t*)message, message_len, signature, signature_len, public_key);

    if (verify_status == OQS_SUCCESS) {
        printf("Chữ ký hợp lệ.\n");
    } else {
        printf("Chữ ký không hợp lệ.\n");
    }

    // Giải phóng bộ nhớ
    free(public_key);
    free(secret_key);
    free(signature);
    OQS_SIG_free(sig);

    return EXIT_SUCCESS;
}
