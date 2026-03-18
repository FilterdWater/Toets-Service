<?php

test('redirects to login page', function () {
    $response = $this->get(route('root'));

    $response->assertRedirectToRoute('login');
});
